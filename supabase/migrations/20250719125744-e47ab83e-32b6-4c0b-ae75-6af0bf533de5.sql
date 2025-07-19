-- Create role enum for users
CREATE TYPE user_role AS ENUM ('admin', 'customer');

-- Create users table
CREATE TABLE public.users (
  phone_number TEXT PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chats table
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone TEXT NOT NULL REFERENCES public.users(phone_number),
  question TEXT NOT NULL,
  bot_response TEXT,
  file_url TEXT,
  is_unsatisfied BOOLEAN NOT NULL DEFAULT false,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unsatisfied_queries table
CREATE TABLE public.unsatisfied_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id),
  user_phone TEXT NOT NULL REFERENCES public.users(phone_number),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_url TEXT
);

-- Create faqs table
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  response TEXT NOT NULL
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  phone_number TEXT NOT NULL REFERENCES public.users(phone_number),
  product TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for chat uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('chat_uploads', 'chat_uploads', true);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unsatisfied_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view their own data" ON public.users
FOR SELECT USING (phone_number = auth.jwt() ->> 'phone');

CREATE POLICY "Admins can view all users" ON public.users
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.users WHERE phone_number = auth.jwt() ->> 'phone' AND role = 'admin'
));

-- Create RLS policies for chats
CREATE POLICY "Users can view their own chats" ON public.chats
FOR SELECT USING (user_phone = auth.jwt() ->> 'phone');

CREATE POLICY "Admins can view all chats" ON public.chats
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.users WHERE phone_number = auth.jwt() ->> 'phone' AND role = 'admin'
));

CREATE POLICY "Users can insert their own chats" ON public.chats
FOR INSERT WITH CHECK (user_phone = auth.jwt() ->> 'phone');

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (phone_number = auth.jwt() ->> 'phone');

CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.users WHERE phone_number = auth.jwt() ->> 'phone' AND role = 'admin'
));

-- Create RLS policies for FAQs (public read)
CREATE POLICY "Anyone can view FAQs" ON public.faqs
FOR SELECT USING (true);

CREATE POLICY "Admins can manage FAQs" ON public.faqs
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.users WHERE phone_number = auth.jwt() ->> 'phone' AND role = 'admin'
));

-- Create RLS policies for unsatisfied_queries
CREATE POLICY "Admins can view unsatisfied queries" ON public.unsatisfied_queries
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.users WHERE phone_number = auth.jwt() ->> 'phone' AND role = 'admin'
));

-- Create storage policies for chat_uploads bucket
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat_uploads');

CREATE POLICY "Users can view uploaded files" ON storage.objects
FOR SELECT USING (bucket_id = 'chat_uploads');

CREATE POLICY "Admins can manage all files" ON storage.objects
FOR ALL USING (bucket_id = 'chat_uploads' AND EXISTS (
  SELECT 1 FROM public.users WHERE phone_number = auth.jwt() ->> 'phone' AND role = 'admin'
));