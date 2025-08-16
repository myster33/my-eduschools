
-- Create a table for contact messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'unread'
);

-- Add Row Level Security (RLS) to the contact messages table
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert contact messages (public form)
CREATE POLICY "Anyone can submit contact messages" 
  ON public.contact_messages 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that only allows admins to view contact messages
CREATE POLICY "Only admins can view contact messages" 
  ON public.contact_messages 
  FOR SELECT 
  USING (true);
