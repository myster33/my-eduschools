
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RegistrationFormRequest {
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  studentCount: string;
  plan: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Send registration email function called");
    
    const registrationData: RegistrationFormRequest = await req.json();
    console.log("Received registration data:", registrationData);

    // Validate required fields
    if (!registrationData.schoolName || !registrationData.contactPerson || !registrationData.email || !registrationData.phone || !registrationData.address || !registrationData.studentCount || !registrationData.plan) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Store the registration in the database
    const { data: insertData, error: insertError } = await supabase
      .from('school_registrations')
      .insert({
        school_name: registrationData.schoolName,
        contact_person: registrationData.contactPerson,
        email: registrationData.email,
        phone: registrationData.phone,
        address: registrationData.address,
        student_count: registrationData.studentCount,
        plan: registrationData.plan,
        message: registrationData.message || null
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Failed to store registration: ${insertError.message}`);
    }

    console.log("Registration stored successfully:", insertData);

    // Format the email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New School Registration</h2>
        
        <h3 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">School Information:</h3>
        <ul style="line-height: 1.6;">
          <li><strong>School Name:</strong> ${registrationData.schoolName}</li>
          <li><strong>Contact Person:</strong> ${registrationData.contactPerson}</li>
          <li><strong>Email:</strong> ${registrationData.email}</li>
          <li><strong>Phone:</strong> ${registrationData.phone}</li>
          <li><strong>Address:</strong> ${registrationData.address}</li>
          <li><strong>Student Count:</strong> ${registrationData.studentCount}</li>
          <li><strong>Selected Plan:</strong> ${registrationData.plan}</li>
        </ul>

        ${registrationData.message ? `
        <h3 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">Additional Message:</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <p style="white-space: pre-wrap; margin: 0;">${registrationData.message}</p>
        </div>
        ` : ''}

        <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280;"><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
        <p style="color: #6b7280;"><strong>Registration ID:</strong> ${insertData.id}</p>
      </div>
    `;

    // Send email to admin
    const recipientEmail = "admin@eduschools.co.za";
    console.log("Sending email to admin address:", recipientEmail);

    const emailResponse = await resend.emails.send({
      from: "EduSchools Registration <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `New School Registration: ${registrationData.schoolName}`,
      html: emailContent,
    });

    console.log("Email response:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      throw new Error(`Email service error: ${emailResponse.error.message || 'Unknown error'}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      registrationId: insertData.id,
      message: "Registration submitted successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-registration-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
