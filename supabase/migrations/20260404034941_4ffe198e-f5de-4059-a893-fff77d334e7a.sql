-- Create enum for content status
CREATE TYPE public.content_status AS ENUM ('draft', 'pending_approval', 'approved', 'published', 'rejected');

-- Create content_calendar table
CREATE TABLE public.content_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT 'facebook',
  caption TEXT NOT NULL DEFAULT '',
  hashtags TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status content_status NOT NULL DEFAULT 'draft',
  author TEXT NOT NULL DEFAULT 'ทีมงาน',
  notes TEXT DEFAULT '',
  approval_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admins can manage content calendar" ON public.content_calendar FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Add updated_at trigger
CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON public.content_calendar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();