-- Add source tracking and page views
ALTER TABLE public.click_tracking
ADD COLUMN IF NOT EXISTS source text DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS page_url text;

-- Create page views tracking table
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  page_url text NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  device_type text,
  country_code text,
  city text,
  referrer text,
  source text DEFAULT 'direct'
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Create policies for page_views
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view page views"
ON public.page_views
FOR SELECT
USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_click_tracking_session ON public.click_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_click_tracking_timestamp ON public.click_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON public.page_views(timestamp);