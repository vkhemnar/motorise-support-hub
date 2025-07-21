-- Add FAQs for common customer service issues

INSERT INTO public.faqs (question, response) VALUES 
(
  'I received faulty parts in my order',
  'We apologize for the inconvenience. Please contact our support team immediately with your order number and photos of the faulty parts. We will arrange for a replacement or refund within 24-48 hours. You can also mark your chat as unsatisfied to create a support ticket for faster resolution.'
),
(
  'The servicing was not done properly',
  'We take service quality seriously. Please provide details about the specific issues with the servicing. Our technical team will review your case and either arrange for re-servicing at no additional cost or provide appropriate compensation. Contact support with your service ticket number for immediate assistance.'
),
(
  'Are replacement parts available for my scooter?',
  'We maintain a comprehensive inventory of replacement parts for all our scooter models. Most common parts are available for immediate shipping. For specific part availability, please provide your scooter model number and the part you need. Our parts team will confirm availability and delivery timeline within 4-6 hours.'
),
(
  'How long does it take to get replacement parts?',
  'Standard replacement parts are typically delivered within 3-5 business days. Express delivery is available for urgent repairs with 24-48 hour delivery. Rare or specialized parts may take 7-10 business days. We will provide exact timelines when you place your parts order.'
),
(
  'My scooter service was delayed',
  'We understand the frustration of delayed service. Please share your service appointment details so we can track the status. We offer priority rescheduling for delayed appointments and may provide service credits for significant delays. Our service team will contact you within 2 hours to resolve this.'
);