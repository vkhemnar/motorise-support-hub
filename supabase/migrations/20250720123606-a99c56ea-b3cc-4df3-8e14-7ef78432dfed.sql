-- Temporarily allow anonymous access for testing
DROP POLICY IF EXISTS "Allow all authenticated access" ON public.chats;
DROP POLICY IF EXISTS "Allow all authenticated access" ON public.users;
DROP POLICY IF EXISTS "Allow all authenticated access" ON public.orders;
DROP POLICY IF EXISTS "Allow all authenticated access" ON public.unsatisfied_queries;

-- Create policies that allow anonymous access (temporary for testing)
CREATE POLICY "Allow anonymous access" ON public.chats
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access" ON public.users
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access" ON public.orders
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access" ON public.unsatisfied_queries
FOR ALL USING (true) WITH CHECK (true);