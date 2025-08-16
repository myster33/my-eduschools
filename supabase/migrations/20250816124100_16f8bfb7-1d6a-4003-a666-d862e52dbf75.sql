
-- Update the RLS policy to allow anyone to insert demo bookings
DROP POLICY IF EXISTS "Anyone can create demo bookings" ON public.demo_bookings;

CREATE POLICY "Anyone can create demo bookings" 
  ON public.demo_bookings 
  FOR INSERT 
  WITH CHECK (true);
