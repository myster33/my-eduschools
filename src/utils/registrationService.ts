
// Registration service for sending school registration data
export interface RegistrationFormData {
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  studentCount: string;
  plan: string;
  message?: string;
}

export const sendRegistration = async (formData: RegistrationFormData): Promise<void> => {
  try {
    console.log('Sending registration with data:', formData);
    
    // Send registration data to Supabase edge function
    const response = await fetch('https://cywhqczjppupwiliofbo.supabase.co/functions/v1/send-registration-email', {
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

    console.log('Registration service response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Registration submission failed - Response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Unknown error' };
      }
      
      throw new Error(`Failed to submit registration: ${errorData.error || 'Server error'}`);
    }

    const result = await response.json();
    console.log('Registration submitted successfully:', result);
  } catch (error) {
    console.error('Error in sendRegistration:', error);
    throw error;
  }
};
