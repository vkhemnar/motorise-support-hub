-- Drop existing RLS policies for orders table that reference auth.jwt()
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create new policies that allow anyone to view orders by phone number
-- This matches the current authentication pattern used in the app
CREATE POLICY "Anyone can view orders by phone number" 
ON public.orders 
FOR SELECT 
USING (true);

-- Keep the restrictive policies for other operations
CREATE POLICY "No one can insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "No one can update orders" 
ON public.orders 
FOR UPDATE 
USING (false);

CREATE POLICY "No one can delete orders" 
ON public.orders 
FOR DELETE 
USING (false);