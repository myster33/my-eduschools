
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { sendRegistration, type RegistrationFormData } from '@/utils/registrationService';
import { toast } from 'sonner';

const Registration = () => {
  const location = useLocation();
  const selectedPlan = location.state?.planName || 'Starter';
  
  const [formData, setFormData] = useState({
    schoolName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    studentCount: '',
    plan: selectedPlan,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await sendRegistration(formData);
      setShowSuccessDialog(true);
      
      // Reset form
      setFormData({
        schoolName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        studentCount: '',
        plan: selectedPlan,
        message: ''
      });
    } catch (error) {
      console.error('Registration submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Register Your School
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with Eduschools today. Fill out the form below and we'll get back to you shortly.
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">School Registration Form</CardTitle>
                <p className="text-gray-600">Selected Plan: <span className="font-semibold text-primary">{selectedPlan}</span></p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="schoolName">School Name *</Label>
                      <Input
                        id="schoolName"
                        type="text"
                        required
                        value={formData.schoolName}
                        onChange={(e) => handleInputChange('schoolName', e.target.value)}
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        type="text"
                        required
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">School Address *</Label>
                    <Textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="mt-1"
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="studentCount">Number of Students *</Label>
                      <Select 
                        value={formData.studentCount} 
                        onValueChange={(value) => handleInputChange('studentCount', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select student count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-100">1-100 students</SelectItem>
                          <SelectItem value="101-300">101-300 students</SelectItem>
                          <SelectItem value="301-500">301-500 students</SelectItem>
                          <SelectItem value="501-1000">501-1000 students</SelectItem>
                          <SelectItem value="1000+">1000+ students</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="plan">Selected Plan</Label>
                      <Select 
                        value={formData.plan} 
                        onValueChange={(value) => handleInputChange('plan', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Freemium">Freemium</SelectItem>
                          <SelectItem value="Starter">Starter</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Additional Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="mt-1"
                      rows={4}
                      placeholder="Tell us about your school's specific needs..."
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-lg py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-2xl text-green-600">Registration Submitted Successfully!</DialogTitle>
            <DialogDescription className="text-gray-600 mt-4">
              Thank you for registering your school with EduSchools. We've received your registration and will contact you shortly to discuss next steps.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Button 
              onClick={() => setShowSuccessDialog(false)}
              className="px-8"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Registration;
