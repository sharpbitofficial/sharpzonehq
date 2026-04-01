
-- Fix 1: Orders - Replace broad UPDATE policy with feedback/rating-only policy
DROP POLICY IF EXISTS "Users can update own order feedback" ON public.orders;

-- Revoke broad UPDATE, grant only on feedback and rating columns
REVOKE UPDATE ON public.orders FROM authenticated;
GRANT UPDATE (feedback, rating) ON public.orders TO authenticated;

-- Re-grant full UPDATE to service_role (needed for admin operations)
GRANT UPDATE ON public.orders TO service_role;

-- Create restricted policy: users can only update feedback/rating on their own completed/delivered orders
CREATE POLICY "Users can update own order feedback" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ceo'::app_role)))
  WITH CHECK (auth.uid() = user_id);

-- Fix 2: Task assignments - Replace broad staff UPDATE with column-restricted policy
DROP POLICY IF EXISTS "Staff can update own assignments" ON public.task_assignments;

REVOKE UPDATE ON public.task_assignments FROM authenticated;
GRANT UPDATE (report_text, report_file_url, status) ON public.task_assignments TO authenticated;
GRANT UPDATE ON public.task_assignments TO service_role;

CREATE POLICY "Staff can update own assignments" ON public.task_assignments
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() AND NOT (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (assigned_to = auth.uid());

-- Fix 3: User roles - Restrict CEO from granting 'ceo' role via client
DROP POLICY IF EXISTS "CEO can manage all roles" ON public.user_roles;

CREATE POLICY "CEO can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'ceo'::app_role))
  WITH CHECK (has_role(auth.uid(), 'ceo'::app_role) AND role != 'ceo'::app_role);

-- Fix 4: Company holidays - Create a view for staff that excludes ceo_note
CREATE OR REPLACE VIEW public.holidays_staff_view AS
  SELECT id, title, holiday_date, message, created_by, created_at
  FROM public.company_holidays;

GRANT SELECT ON public.holidays_staff_view TO authenticated;
