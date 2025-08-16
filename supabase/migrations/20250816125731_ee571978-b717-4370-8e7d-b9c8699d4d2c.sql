
-- First, drop all existing policies on demo_bookings
DROP POLICY IF EXISTS "Public can create demo bookings" ON public.demo_bookings;
DROP POLICY IF EXISTS "Admins can view all demo bookings" ON public.demo_bookings;

-- Disable RLS temporarily to clear any issues
ALTER TABLE public.demo_bookings DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.demo_bookings ENABLE ROW LEVEL SECURITY;

-- Create a completely permissive policy for all operations (for now)
CREATE POLICY "Allow all operations on demo_bookings" 
  ON public.demo_bookings 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions to public role
GRANT INSERT ON public.demo_bookings TO public;
GRANT SELECT ON public.demo_bookings TO public;

-- Also grant usage on the sequence for the UUID generation
GRANT USAGE ON SCHEMA public TO public;
