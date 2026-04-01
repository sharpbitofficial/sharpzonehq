
DROP VIEW IF EXISTS public.holidays_staff_view;

CREATE VIEW public.holidays_staff_view 
WITH (security_invoker = true) AS
  SELECT id, title, holiday_date, message, created_by, created_at
  FROM public.company_holidays;

GRANT SELECT ON public.holidays_staff_view TO authenticated;
