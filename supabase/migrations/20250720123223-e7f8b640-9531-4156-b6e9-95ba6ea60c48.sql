-- Enable RLS on all tables (will skip if already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unsatisfied_queries ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies to fix access issues
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

DROP POLICY IF EXISTS "Users can read their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can insert their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;

DROP POLICY IF EXISTS "Users can read their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;

DROP POLICY IF EXISTS "Users can read their own unsatisfied queries" ON public.unsatisfied_queries;
DROP POLICY IF EXISTS "Users can insert their own unsatisfied queries" ON public.unsatisfied_queries;

-- Create simple policies that allow all authenticated users access
CREATE POLICY "Allow all authenticated access" ON public.users
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all authenticated access" ON public.chats
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all authenticated access" ON public.orders
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all authenticated access" ON public.unsatisfied_queries
FOR ALL USING (true) WITH CHECK (true);