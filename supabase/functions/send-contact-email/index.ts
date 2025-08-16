
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Send contact email function called");
    
    const contactData: ContactFormRequest = await req.json();
    console.log("Received contact data:", contactData);

    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, subject, or message" }),
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

    // Store the contact message in the database
    const { data: insertData, error: insertError } = await supabase
      .from('contact_messages')
      .insert({
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone || null,
        subject: contactData.subject,
        message: contactData.message
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Failed to store contact message: ${insertError.message}`);
    }

    console.log("Contact message stored successfully:", insertData);

    // Format the email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Message</h2>
        
        <h3 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">Contact Details:</h3>
        <ul style="line-height: 1.6;">
          <li><strong>Name:</strong> ${contactData.name}</li>
          <li><strong>Email:</strong> ${contactData.email}</li>
          ${contactData.phone ? `<li><strong>Phone:</strong> ${contactData.phone}</li>` : ''}
          <li><strong>Subject:</strong> ${contactData.subject}</li>
        </ul>

        <h3 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">Message:</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <p style="white-space: pre-wrap; margin: 0;">${contactData.message}</p>
        </div>

        <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280;"><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
        <p style="color: #6b7280;"><strong>Message ID:</strong> ${insertData.id}</p>
      </div>
    `;

    // Send email to admin
    const recipientEmail = "admin@eduschools.co.za";
    console.log("Sending email to admin address:", recipientEmail);

    const emailResponse = await resend.emails.send({
      from: "EduSchools Contact <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `New Contact Message: ${contactData.subject}`,
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
      messageId: insertData.id,
      message: "Contact message sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
