CREATE TABLE IF NOT EXISTS public.user_role_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  previous_role public.app_role,
  new_role public.app_role,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_role_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CEO can read role audit logs" ON public.user_role_audit_logs;
CREATE POLICY "CEO can read role audit logs"
ON public.user_role_audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'));

CREATE OR REPLACE FUNCTION public.audit_user_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_role_audit_logs (actor_user_id, target_user_id, action, new_role)
    VALUES (auth.uid(), NEW.user_id, 'insert', NEW.role);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.user_role_audit_logs (actor_user_id, target_user_id, action, previous_role, new_role)
    VALUES (auth.uid(), NEW.user_id, 'update', OLD.role, NEW.role);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.user_role_audit_logs (actor_user_id, target_user_id, action, previous_role)
    VALUES (auth.uid(), OLD.user_id, 'delete', OLD.role);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_user_roles ON public.user_roles;
CREATE TRIGGER trg_audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_user_role_changes();

DROP POLICY IF EXISTS "CEO can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "CEO can read all roles" ON public.user_roles;
CREATE POLICY "CEO can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'));

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can submit form responses" ON public.form_responses;
DROP POLICY IF EXISTS "Anyone can submit employee application" ON public.employee_applications;
DROP POLICY IF EXISTS "Anyone can validate coupons" ON public.coupons;

CREATE OR REPLACE FUNCTION public.submit_newsletter_subscription(_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email TEXT;
  subscription_id UUID;
BEGIN
  normalized_email := lower(trim(_email));

  IF normalized_email IS NULL OR normalized_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF normalized_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
    RAISE EXCEPTION 'Please enter a valid email address';
  END IF;

  INSERT INTO public.newsletter_subscriptions (email)
  VALUES (normalized_email)
  RETURNING id INTO subscription_id;

  RETURN subscription_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_form_response(_responses JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  response_id UUID;
BEGIN
  IF _responses IS NULL OR jsonb_typeof(_responses) <> 'object' OR _responses = '{}'::jsonb THEN
    RAISE EXCEPTION 'Responses are required';
  END IF;

  INSERT INTO public.form_responses (responses, submitted_at)
  VALUES (_responses, now())
  RETURNING id INTO response_id;

  RETURN response_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_employee_application(
  _full_name TEXT,
  _phone TEXT,
  _email TEXT,
  _address TEXT,
  _profession TEXT,
  _institution TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  application_id UUID;
  normalized_email TEXT;
BEGIN
  normalized_email := lower(trim(_email));

  IF trim(coalesce(_full_name, '')) = '' THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;

  IF normalized_email IS NULL OR normalized_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF normalized_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
    RAISE EXCEPTION 'Please enter a valid email address';
  END IF;

  IF trim(coalesce(_address, '')) = '' THEN
    RAISE EXCEPTION 'Address is required';
  END IF;

  IF trim(coalesce(_profession, '')) = '' THEN
    RAISE EXCEPTION 'Profession is required';
  END IF;

  INSERT INTO public.employee_applications (full_name, phone, email, address, profession, institution)
  VALUES (trim(_full_name), trim(coalesce(_phone, '')), normalized_email, trim(_address), trim(_profession), nullif(trim(coalesce(_institution, '')), ''))
  RETURNING id INTO application_id;

  RETURN application_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_coupon_code(_code TEXT)
RETURNS TABLE (
  id UUID,
  code TEXT,
  discount_percent INTEGER,
  expires_at TIMESTAMPTZ,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.code,
    c.discount_percent,
    c.expires_at,
    (c.is_active = true AND (c.expires_at IS NULL OR c.expires_at > now())) AS is_valid
  FROM public.coupons c
  WHERE upper(c.code) = upper(trim(_code))
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_newsletter_subscription(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_form_response(JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_employee_application(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_coupon_code(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_newsletter_subscription(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_form_response(JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_employee_application(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_coupon_code(TEXT) TO anon, authenticated;