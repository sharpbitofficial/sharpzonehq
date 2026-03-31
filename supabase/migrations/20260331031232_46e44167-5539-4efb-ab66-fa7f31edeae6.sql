
-- Tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  frequency TEXT DEFAULT 'daily',
  deadline TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  is_emergency BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Task assignments table
CREATE TABLE public.task_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL,
  assigned_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  report_text TEXT DEFAULT '',
  report_file_url TEXT DEFAULT '',
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  transferred_from UUID,
  transferred_to UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Company holidays table
CREATE TABLE public.company_holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  holiday_date DATE NOT NULL,
  message TEXT DEFAULT '',
  ceo_note TEXT DEFAULT '',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_holidays ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "CEO/Admin can manage tasks" ON public.tasks FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can read assigned tasks" ON public.tasks FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) AND EXISTS (
    SELECT 1 FROM public.task_assignments WHERE task_id = tasks.id AND assigned_to = auth.uid()
  ));

-- Task assignments policies
CREATE POLICY "CEO/Admin can manage assignments" ON public.task_assignments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can read own assignments" ON public.task_assignments FOR SELECT TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Staff can update own assignments" ON public.task_assignments FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Company holidays policies
CREATE POLICY "CEO can manage holidays" ON public.company_holidays FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'ceo'::app_role))
  WITH CHECK (has_role(auth.uid(), 'ceo'::app_role));

CREATE POLICY "Staff can read holidays" ON public.company_holidays FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for task_assignments and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Updated_at triggers
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER task_assignments_updated_at BEFORE UPDATE ON public.task_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
