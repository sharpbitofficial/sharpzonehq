/*
  # Add Survey Form Tables

  1. New Tables
    - `form_fields`
      - `id` (uuid, primary key)
      - `type` (text) - text, textarea, multiple_choice, checkbox, dropdown
      - `question` (text)
      - `options` (text array) - for multiple choice, checkbox, dropdown
      - `required` (boolean)
      - `display_order` (int)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `form_responses`
      - `id` (uuid, primary key)
      - `responses` (jsonb)
      - `submitted_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Anyone can submit form responses
    - Only CEO/Admins can view responses and manage fields
*/

CREATE TABLE IF NOT EXISTS public.form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('text', 'textarea', 'multiple_choice', 'checkbox', 'dropdown')),
  question TEXT NOT NULL,
  options TEXT[] DEFAULT '{}',
  required BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active form fields"
  ON public.form_fields FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage form fields"
  ON public.form_fields FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'ceo'));

-- Form Responses Table
CREATE TABLE IF NOT EXISTS public.form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  responses JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all form responses"
  ON public.form_responses FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'ceo'));

CREATE POLICY "Anyone can submit form responses"
  ON public.form_responses FOR INSERT
  WITH CHECK (true);
