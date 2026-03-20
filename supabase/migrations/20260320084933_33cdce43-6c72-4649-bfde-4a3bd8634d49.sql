
-- Fix the overly permissive INSERT policy on orders
-- Replace with a check that ensures required fields are present
DROP POLICY "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders with valid data" ON public.orders
  FOR INSERT WITH CHECK (
    customer_name IS NOT NULL AND customer_name != '' AND
    customer_phone IS NOT NULL AND customer_phone != '' AND
    customer_email IS NOT NULL AND customer_email != ''
  );
