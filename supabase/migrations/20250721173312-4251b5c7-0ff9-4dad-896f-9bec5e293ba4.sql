-- Add constraint to ensure phone numbers are exactly 10 digits

-- Add check constraint to users table
ALTER TABLE public.users 
ADD CONSTRAINT phone_number_10_digits 
CHECK (phone_number ~ '^[0-9]{10}$');

-- Add check constraint to chats table
ALTER TABLE public.chats 
ADD CONSTRAINT user_phone_10_digits 
CHECK (user_phone ~ '^[0-9]{10}$');

-- Add check constraint to tickets table
ALTER TABLE public.tickets 
ADD CONSTRAINT user_phone_10_digits 
CHECK (user_phone ~ '^[0-9]{10}$');

-- Add check constraint to ticket_responses table
ALTER TABLE public.ticket_responses 
ADD CONSTRAINT admin_phone_10_digits 
CHECK (admin_phone ~ '^[0-9]{10}$');

-- Add check constraint to unsatisfied_queries table
ALTER TABLE public.unsatisfied_queries 
ADD CONSTRAINT user_phone_10_digits 
CHECK (user_phone ~ '^[0-9]{10}$');

-- Add check constraint to orders table
ALTER TABLE public.orders 
ADD CONSTRAINT phone_number_10_digits 
CHECK (phone_number ~ '^[0-9]{10}$');