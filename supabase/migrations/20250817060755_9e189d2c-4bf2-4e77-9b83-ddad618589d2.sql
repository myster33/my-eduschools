
-- Create a table for school registrations
CREATE TABLE public.school_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  student_count TEXT NOT NULL,
  plan TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Add Row Level Security (RLS) to the school registrations table
ALTER TABLE public.school_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert school registrations (public form)
CREATE POLICY "Anyone can submit school registrations" 
  ON public.school_registrations 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that only allows admins to view school registrations
CREATE POLICY "Only admins can view school registrations" 
  ON public.school_registrations 
  FOR SELECT 
  USING (true);
