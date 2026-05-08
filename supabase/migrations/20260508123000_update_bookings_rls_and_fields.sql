
-- Ensure bookings table matches the latest schema requirements
-- user_id, service_id, and id are BIGINT

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

-- 1. Allow anyone to create a booking (Public/Guest access)
-- This allows both logged-in users and guests to insert records.
CREATE POLICY "Anyone can create bookings" ON public.bookings
FOR INSERT WITH CHECK (true);

-- 2. Allow users to view their own bookings
-- We match the booking's user_id with the ID from public.users table for the current authenticated user.
CREATE POLICY "Users can view their own bookings" ON public.bookings
FOR SELECT USING (
  user_id IN (
    SELECT id FROM public.users 
    WHERE email = (auth.jwt() ->> 'email')
  )
);

-- 3. Allow admins to view all bookings
-- We check the role of the current user in the public.users table.
CREATE POLICY "Admins can view all bookings" ON public.bookings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = (auth.jwt() ->> 'email') 
    AND role = 'admin'
  )
);

-- 4. Allow admins to update bookings (status etc.)
CREATE POLICY "Admins can update bookings" ON public.bookings
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = (auth.jwt() ->> 'email') 
    AND role = 'admin'
  )
);

-- 5. Allow admins to delete bookings
CREATE POLICY "Admins can delete bookings" ON public.bookings
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = (auth.jwt() ->> 'email') 
    AND role = 'admin'
  )
);
