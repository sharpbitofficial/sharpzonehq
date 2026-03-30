
-- Employee applications table for CEO approval flow
CREATE TABLE public.employee_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL,
  address text NOT NULL DEFAULT '',
  profession text NOT NULL DEFAULT '',
  institution text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid DEFAULT NULL,
  reviewed_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.employee_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an employee application
CREATE POLICY "Anyone can submit employee application"
  ON public.employee_applications FOR INSERT
  TO public
  WITH CHECK (true);

-- CEO can read all applications
CREATE POLICY "CEO can read all applications"
  ON public.employee_applications FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- CEO can update application status
CREATE POLICY "CEO can update applications"
  ON public.employee_applications FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'ceo'::app_role))
  WITH CHECK (has_role(auth.uid(), 'ceo'::app_role));

-- CEO can delete applications
CREATE POLICY "CEO can delete applications"
  ON public.employee_applications FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'ceo'::app_role));
