-- Add unique constraint to order_id column to prevent duplicates
ALTER TABLE public.orders 
ADD CONSTRAINT order_id_unique 
UNIQUE (order_id);