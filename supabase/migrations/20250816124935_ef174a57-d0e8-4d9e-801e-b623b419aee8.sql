
-- First, let's drop all existing policies on demo_bookings
DROP POLICY IF EXISTS "Anyone can create demo bookings" ON public.demo_bookings;
DROP POLICY IF EXISTS "Only admins can view demo bookings" ON public.demo_bookings;
DROP POLICY IF EXISTS "Users can view their own demo bookings" ON public.demo_bookings;

-- Temporarily disable RLS to allow inserts
ALTER TABLE public.demo_bookings DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.demo_bookings ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows anyone to insert
CREATE POLICY "Allow public demo booking creation" 
  ON public.demo_bookings 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Create policies for viewing (only admins can view all bookings)
CREATE POLICY "Admins can view all demo bookings" 
  ON public.demo_bookings 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'::app_role
    )
  );

-- Allow users to view their own bookings by email
CREATE POLICY "Users can view own demo bookings by email" 
  ON public.demo_bookings 
  FOR SELECT 
  TO public
  USING (
    CASE 
      WHEN auth.uid() IS NULL THEN false
      ELSE (auth.jwt() ->> 'email') = email
    END
  );
