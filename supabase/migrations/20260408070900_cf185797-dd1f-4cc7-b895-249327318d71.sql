-- Fix 1: BEFORE INSERT trigger to enforce correct pricing on orders
CREATE OR REPLACE FUNCTION public.enforce_order_pricing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_price numeric;
  coupon_discount integer;
BEGIN
  -- Look up the event price
  IF NEW.event_id IS NOT NULL THEN
    SELECT price INTO event_price FROM public.events WHERE id = NEW.event_id;
    IF event_price IS NULL THEN
      RAISE EXCEPTION 'Invalid event_id';
    END IF;
    NEW.price := event_price;
  END IF;

  -- Compute final_price from coupon if provided
  IF NEW.coupon_id IS NOT NULL THEN
    SELECT discount_percent INTO coupon_discount
    FROM public.coupons
    WHERE id = NEW.coupon_id AND is_active = true AND (expires_at IS NULL OR expires_at > now());
    
    IF coupon_discount IS NULL THEN
      NEW.coupon_id := NULL;
      NEW.final_price := NEW.price;
    ELSE
      NEW.final_price := NEW.price * (100 - coupon_discount) / 100.0;
    END IF;
  ELSE
    NEW.final_price := NEW.price;
  END IF;

  -- Force status to pending on insert
  NEW.status := 'pending';

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_order_pricing
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_order_pricing();

-- Fix 2: Create RPC for customer feedback updates instead of broad UPDATE policy
CREATE OR REPLACE FUNCTION public.update_order_feedback(_order_id uuid, _feedback text, _rating integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF _rating IS NOT NULL AND (_rating < 1 OR _rating > 5) THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  UPDATE public.orders
  SET feedback = _feedback, rating = _rating, updated_at = now()
  WHERE id = _order_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or not yours';
  END IF;
END;
$$;

-- Drop the overly broad customer UPDATE policy
DROP POLICY IF EXISTS "Users can update own order feedback" ON public.orders;

-- Fix 3: Restrict has_role to only check the calling user's own roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN _user_id <> auth.uid() THEN false
    ELSE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
  END;
$$;