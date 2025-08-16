
// Contact service for sending contact form data
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const sendContactMessage = async (formData: ContactFormData): Promise<void> => {
  try {
    console.log('Sending contact message with data:', formData);
    
    // Send contact data to Supabase edge function
    const response = await fetch('https://cywhqczjppupwiliofbo.supabase.co/functions/v1/send-contact-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5d2hxY3pqcHB1cHdpbGlvZmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzUwNzgsImV4cCI6MjA3MDc1MTA3OH0.nNib6UdaoCaYH8jWoZAwQUbnCN0D_KcATG3ucG5ZcQk`,
      },
      body: JSON.stringify({
        ...formData,
        submissionDate: new Date().toISOString()
      }),
    });

    console.log('Contact service response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Contact message sending failed - Response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Unknown error' };
      }
      
      throw new Error(`Failed to send contact message: ${errorData.error || 'Server error'}`);
    }

    const result = await response.json();
    console.log('Contact message sent successfully:', result);
  } catch (error) {
    console.error('Error in sendContactMessage:', error);
    throw error;
  }
};
