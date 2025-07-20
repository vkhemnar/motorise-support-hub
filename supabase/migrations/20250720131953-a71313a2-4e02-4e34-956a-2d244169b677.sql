-- Create ticket status enum
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved');

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id),
  user_phone TEXT NOT NULL,
  title TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket_responses table for admin responses
CREATE TABLE public.ticket_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  admin_phone TEXT NOT NULL,
  response_text TEXT,
  response_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for tickets
CREATE POLICY "Users can view their own tickets" 
ON public.tickets 
FOR SELECT 
USING (user_phone = (auth.jwt() ->> 'phone'::text));

CREATE POLICY "Admins can view all tickets" 
ON public.tickets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE phone_number = (auth.jwt() ->> 'phone'::text) 
  AND role = 'admin'
));

CREATE POLICY "Admins can update tickets" 
ON public.tickets 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE phone_number = (auth.jwt() ->> 'phone'::text) 
  AND role = 'admin'
));

CREATE POLICY "System can create tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for ticket_responses
CREATE POLICY "Users can view responses to their tickets" 
ON public.ticket_responses 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.tickets 
  WHERE tickets.id = ticket_responses.ticket_id 
  AND tickets.user_phone = (auth.jwt() ->> 'phone'::text)
));

CREATE POLICY "Admins can view all ticket responses" 
ON public.ticket_responses 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE phone_number = (auth.jwt() ->> 'phone'::text) 
  AND role = 'admin'
));

CREATE POLICY "Admins can create ticket responses" 
ON public.ticket_responses 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users 
  WHERE phone_number = (auth.jwt() ->> 'phone'::text) 
  AND role = 'admin'
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ticket_timestamp();