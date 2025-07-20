-- Ensure users table has proper primary key and handle duplicates
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE public.users ADD PRIMARY KEY (phone_number);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users(created_at);