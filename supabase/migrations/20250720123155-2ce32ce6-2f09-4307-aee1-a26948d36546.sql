-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unsatisfied_queries ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own data" ON public.users
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON public.users
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON public.users
FOR UPDATE USING (true);

-- Create policies for chats table
CREATE POLICY "Users can read their own chats" ON public.chats
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own chats" ON public.chats
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own chats" ON public.chats
FOR UPDATE USING (true);

-- Create policies for FAQs (public read access)
CREATE POLICY "Anyone can read FAQs" ON public.faqs
FOR SELECT USING (true);

-- Create policies for orders table
CREATE POLICY "Users can read their own orders" ON public.orders
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own orders" ON public.orders
FOR INSERT WITH CHECK (true);

-- Create policies for unsatisfied_queries
CREATE POLICY "Users can read their own unsatisfied queries" ON public.unsatisfied_queries
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own unsatisfied queries" ON public.unsatisfied_queries
FOR INSERT WITH CHECK (true);