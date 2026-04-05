
-- 1. Drop the overly permissive anon SELECT policy on orders
DROP POLICY IF EXISTS "Anyone can find orders by order number" ON public.orders;

-- 2. Create secure RPC for order lookup (parameterized, no filter injection)
CREATE OR REPLACE FUNCTION public.find_order_by_number_and_contact(
  _order_number TEXT,
  _contact TEXT
)
RETURNS SETOF public.orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.orders
  WHERE order_number = _order_number
    AND (customer_phone = _contact OR lower(customer_email) = lower(_contact));
$$;

GRANT EXECUTE ON FUNCTION public.find_order_by_number_and_contact(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.find_order_by_number_and_contact(TEXT, TEXT) TO authenticated;

-- 3. Create secure RPC for order creation with server-side price validation
CREATE OR REPLACE FUNCTION public.create_order_secure(
  _items JSONB,
  _customer_name TEXT,
  _customer_phone TEXT,
  _customer_email TEXT,
  _customer_address TEXT DEFAULT '',
  _province TEXT DEFAULT '',
  _postal_code TEXT DEFAULT '',
  _note TEXT DEFAULT '',
  _coupon_code TEXT DEFAULT '',
  _payment_method payment_method DEFAULT 'promptpay',
  _order_number TEXT DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _subtotal INTEGER := 0;
  _discount INTEGER := 0;
  _shipping INTEGER := 0;
  _total INTEGER := 0;
  _item JSONB;
  _product RECORD;
  _coupon RECORD;
  _result public.orders;
  _qty INTEGER;
BEGIN
  -- Validate required fields
  IF _customer_name IS NULL OR _customer_name = '' THEN
    RAISE EXCEPTION 'customer_name is required';
  END IF;
  IF _customer_phone IS NULL OR _customer_phone = '' THEN
    RAISE EXCEPTION 'customer_phone is required';
  END IF;
  IF _customer_email IS NULL OR _customer_email = '' THEN
    RAISE EXCEPTION 'customer_email is required';
  END IF;
  IF _items IS NULL OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'items cannot be empty';
  END IF;

  -- Calculate subtotal from product prices in DB
  FOR _item IN SELECT * FROM jsonb_array_elements(_items)
  LOOP
    _qty := COALESCE((_item->>'quantity')::INTEGER, 1);
    IF _qty < 1 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;

    SELECT * INTO _product FROM public.products WHERE id = (_item->>'id')::UUID;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', _item->>'id';
    END IF;
    IF _product.stock < _qty THEN
      RAISE EXCEPTION 'Insufficient stock for product: %', _product.name;
    END IF;

    _subtotal := _subtotal + (_product.price * _qty);
  END LOOP;

  -- Validate coupon server-side
  IF _coupon_code IS NOT NULL AND _coupon_code <> '' THEN
    SELECT * INTO _coupon FROM public.coupons
    WHERE code = _coupon_code AND is_active = true;

    IF FOUND THEN
      IF _coupon.max_uses IS NOT NULL AND _coupon.used_count >= _coupon.max_uses THEN
        -- Coupon exhausted, ignore it
        _coupon_code := '';
      ELSIF _subtotal < _coupon.min_order THEN
        -- Below minimum order, ignore coupon
        _coupon_code := '';
      ELSE
        IF _coupon.discount_type = 'percentage' THEN
          _discount := (_subtotal * _coupon.discount_value / 100);
        ELSE
          _discount := _coupon.discount_value;
        END IF;
        -- Cap discount at subtotal
        IF _discount > _subtotal THEN
          _discount := _subtotal;
        END IF;
        -- Atomically increment used_count
        UPDATE public.coupons SET used_count = used_count + 1 WHERE id = _coupon.id;
      END IF;
    ELSE
      _coupon_code := '';
    END IF;
  END IF;

  -- Calculate shipping (free above 500)
  IF _subtotal - _discount >= 500 THEN
    _shipping := 0;
  ELSE
    _shipping := 50;
  END IF;

  _total := _subtotal + _shipping - _discount;

  -- Generate order number if not provided
  IF _order_number IS NULL OR _order_number = '' THEN
    _order_number := 'DA' || upper(substring(md5(random()::text) from 1 for 8));
  END IF;

  INSERT INTO public.orders (
    order_number, items, customer_name, customer_phone, customer_email,
    customer_address, province, postal_code, note, coupon_code,
    subtotal, shipping, discount, total, status, payment_method, payment_status
  ) VALUES (
    _order_number, _items, _customer_name, _customer_phone, _customer_email,
    _customer_address, _province, _postal_code, _note, _coupon_code,
    _subtotal, _shipping, _discount, _total, 'pending', _payment_method, 'pending'
  )
  RETURNING * INTO _result;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_secure TO anon;
GRANT EXECUTE ON FUNCTION public.create_order_secure TO authenticated;

-- 4. Restrict direct INSERT to admins only (remove public insert policy)
DROP POLICY IF EXISTS "Anyone can create orders with valid data" ON public.orders;

-- Re-add INSERT for admins only
CREATE POLICY "Admins can insert orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
