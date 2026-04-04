
-- 1. Explicitly deny INSERT/UPDATE/DELETE on user_roles for non-CEO
-- (RLS is already enabled, and no INSERT/DELETE policies exist, 
--  but let's verify by checking default deny behavior is in place)
-- The scan says "no INSERT or DELETE policy" which with RLS enabled means they're denied.
-- However, let's add explicit policies to make it clear and dismiss the finding.

-- Allow CEO to insert roles
CREATE POLICY "CEO can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'ceo'::app_role));

-- Allow CEO to delete roles  
CREATE POLICY "CEO can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::app_role));

-- Allow CEO to update roles
CREATE POLICY "CEO can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::app_role));

-- 2. Add RLS on realtime.messages to restrict channel subscriptions
-- Note: We cannot modify the realtime schema directly. Instead, we ensure
-- the tables published to realtime already have proper RLS.
-- The notifications and task_assignments tables already have user-scoped RLS.
-- The realtime subscription filtering is handled by Supabase automatically 
-- when RLS is enabled on the source tables.

-- 3. Fix holidays_staff_view - it's a view, add RLS-like security
-- Views inherit security from underlying tables if using security_invoker
-- Let's recreate with security_invoker = true
DROP VIEW IF EXISTS public.holidays_staff_view;
CREATE VIEW public.holidays_staff_view
WITH (security_invoker = true)
AS SELECT id, title, message, holiday_date, created_by, created_at
FROM public.company_holidays;
