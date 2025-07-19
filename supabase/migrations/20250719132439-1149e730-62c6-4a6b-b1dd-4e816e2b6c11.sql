-- Temporarily disable RLS on users table to work with mock auth
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Update other table policies to be more permissive for testing
-- Update chats policies to allow operations without strict auth requirements
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can insert their own chats" ON public.chats;
DROP POLICY IF EXISTS "Admins can view all chats" ON public.chats;

-- Create more permissive policies for testing
CREATE POLICY "Anyone can view chats" 
ON public.chats 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update chats" 
ON public.chats 
FOR UPDATE 
USING (true);

-- Update unsatisfied_queries to be more permissive
DROP POLICY IF EXISTS "Admins can view unsatisfied queries" ON public.unsatisfied_queries;

CREATE POLICY "Anyone can view unsatisfied queries" 
ON public.unsatisfied_queries 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert unsatisfied queries" 
ON public.unsatisfied_queries 
FOR INSERT 
WITH CHECK (true);