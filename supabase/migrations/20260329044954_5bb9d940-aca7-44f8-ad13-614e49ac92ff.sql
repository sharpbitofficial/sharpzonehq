
-- Partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active partners" ON public.partners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage partners" ON public.partners FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ceo')) WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ceo'));

-- Team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active team members" ON public.team_members FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ceo')) WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ceo'));

-- Newsletter subscriptions table
CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read subscriptions" ON public.newsletter_subscriptions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ceo'));

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ceo')) WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ceo'));

-- Form fields table (Google Form style)
CREATE TABLE public.form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'text',
  question TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active form fields" ON public.form_fields FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage form fields" ON public.form_fields FOR ALL TO authenticated USING (has_role(auth.uid(), 'ceo')) WITH CHECK (has_role(auth.uid(), 'ceo'));

-- Form responses table
CREATE TABLE public.form_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  responses JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit form responses" ON public.form_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "CEO can read form responses" ON public.form_responses FOR SELECT TO authenticated USING (has_role(auth.uid(), 'ceo'));

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  tags JSONB DEFAULT '[]',
  thumbnail_url TEXT DEFAULT '',
  author_id UUID,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ceo')) WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ceo'));

-- User settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  language TEXT DEFAULT 'en',
  dark_mode BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own settings" ON public.user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create user_settings on signup (update handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'phone', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;
