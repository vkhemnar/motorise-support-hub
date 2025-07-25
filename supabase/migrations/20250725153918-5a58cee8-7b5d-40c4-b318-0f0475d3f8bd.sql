-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.update_ticket_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;