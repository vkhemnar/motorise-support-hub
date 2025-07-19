-- Fix RLS policies on users table to prevent infinite recursion and allow user operations

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;

-- Create new policies that don't cause recursion
CREATE POLICY "Anyone can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (phone_number = (auth.jwt() ->> 'phone'::text));

CREATE POLICY "Users can update their own data" 
ON public.users 
FOR UPDATE 
USING (phone_number = (auth.jwt() ->> 'phone'::text));

-- For admin access, we'll create a simpler policy that checks a specific phone number
-- This avoids the recursive lookup issue
CREATE POLICY "Admin phone numbers can view all users" 
ON public.users 
FOR SELECT 
USING (
  (auth.jwt() ->> 'phone'::text) IN ('1234567890', '0987654321') -- Add admin phone numbers here
);

-- Allow admins to update any user data
CREATE POLICY "Admin phone numbers can update all users" 
ON public.users 
FOR UPDATE 
USING (
  (auth.jwt() ->> 'phone'::text) IN ('1234567890', '0987654321') -- Add admin phone numbers here
);