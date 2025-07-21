-- Add constraint to ensure order_id starts with ORD followed by 6 digits

ALTER TABLE public.orders 
ADD CONSTRAINT order_id_format 
CHECK (order_id ~ '^ORD[0-9]{6}$');