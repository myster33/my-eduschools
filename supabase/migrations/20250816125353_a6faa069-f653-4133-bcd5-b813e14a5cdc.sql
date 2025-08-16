
-- Drop the existing demo_bookings table completely
DROP TABLE IF EXISTS public.demo_bookings CASCADE;

-- Recreate the demo_bookings table with proper structure
CREATE TABLE public.demo_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  school_name text NOT NULL,
  position text NOT NULL,
  phone_number text,
  school_type text NOT NULL,
  student_count text NOT NULL,
  current_system text,
  specific_needs text[] DEFAULT '{}',
  preferred_contact_method text NOT NULL,
  timeframe text NOT NULL,
  additional_comments text,
  preferred_demo_date text NOT NULL,
  preferred_demo_time text NOT NULL,
  demo_mode text NOT NULL,
  school_address text NOT NULL,
  booking_datetime timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.demo_bookings ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for public insertions (no authentication required)
CREATE POLICY "Public can create demo bookings" 
  ON public.demo_bookings 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Create policy for admins to view all bookings
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

-- Recreate the get_booked_slots function
CREATE OR REPLACE FUNCTION public.get_booked_slots()
RETURNS TABLE(booking_datetime timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT public.demo_bookings.booking_datetime 
  FROM public.demo_bookings 
  WHERE public.demo_bookings.status != 'cancelled';
$function$;
