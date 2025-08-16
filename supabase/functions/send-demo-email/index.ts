
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookDemoEmailRequest {
  name: string;
  email: string;
  schoolName: string;
  position: string;
  phoneNumber: string;
  schoolType: string;
  studentCount: string;
  currentSystem: string;
  specificNeeds: string[];
  preferredContactMethod: string;
  timeframe: string;
  additionalComments: string;
  preferredDemoDate: string;
  preferredDemoTime: string;
  demoMode: string;
  schoolAddress: string;
  adminEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Send demo email function called");
    
    const bookingData: BookDemoEmailRequest = await req.json();
    console.log("Received booking data:", bookingData);

    // Validate required fields
    if (!bookingData.name || !bookingData.email || !bookingData.schoolName) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, or school name" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Format the email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Demo Booking Request</h2>
        
        <h3 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">Personal Information:</h3>
        <ul style="line-height: 1.6;">
          <li><strong>Name:</strong> ${bookingData.name}</li>
          <li><strong>Email:</strong> ${bookingData.email}</li>
          <li><strong>Position:</strong> ${bookingData.position}</li>
          ${bookingData.phoneNumber ? `<li><strong>Phone:</strong> ${bookingData.phoneNumber}</li>` : ''}
        </ul>

        <h3 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">School Information:</h3>
        <ul style="line-height: 1.6;">
          <li><strong>School Name:</strong> ${bookingData.schoolName}</li>
          <li><strong>School Address:</strong> ${bookingData.schoolAddress}</li>
          <li><strong>School Type:</strong> ${bookingData.schoolType}</li>
          <li><strong>Student Count:</strong> ${bookingData.studentCount}</li>
          ${bookingData.currentSystem ? `<li><strong>Current System:</strong> ${bookingData.currentSystem}</li>` : ''}
        </ul>

        <h3 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">Demo Preferences:</h3>
        <ul style="line-height: 1.6;">
          <li><strong>Preferred Demo Date:</strong> ${bookingData.preferredDemoDate}</li>
          <li><strong>Preferred Demo Time:</strong> ${bookingData.preferredDemoTime}</li>
          <li><strong>Demo Mode:</strong> ${bookingData.demoMode}</li>
          <li><strong>Preferred Contact Method:</strong> ${bookingData.preferredContactMethod}</li>
          <li><strong>Implementation Timeframe:</strong> ${bookingData.timeframe}</li>
          ${bookingData.specificNeeds && bookingData.specificNeeds.length > 0 ? `<li><strong>Interested Features:</strong><br><div style="margin-left: 20px;">${bookingData.specificNeeds.map(feature => `• ${feature}`).join('<br>')}</div></li>` : ''}
          ${bookingData.additionalComments ? `<li><strong>Additional Comments:</strong> ${bookingData.additionalComments}</li>` : ''}
        </ul>

        <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280;"><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `;

    console.log("Attempting to send email to:", bookingData.adminEmail);

    // Send email to admin using the verified email address
    const emailResponse = await resend.emails.send({
      from: "EduSchools Demo <onboarding@resend.dev>",
      to: [bookingData.adminEmail],
      subject: `New Demo Request from ${bookingData.name} - ${bookingData.schoolName}`,
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
      message: "Demo request sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-demo-email function:", error);
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
