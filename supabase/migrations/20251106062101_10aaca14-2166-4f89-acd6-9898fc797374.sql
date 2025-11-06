-- Create click tracking table
CREATE TABLE public.click_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  device_type text,
  session_id text,
  clicked_item_type text NOT NULL,
  clicked_item_id uuid NOT NULL,
  country_code text,
  city text,
  referrer text,
  screen_resolution text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create country permissions table for web results
CREATE TABLE public.web_result_countries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  web_result_id uuid NOT NULL REFERENCES public.web_results(id) ON DELETE CASCADE,
  allowed_countries text[] DEFAULT '{}',
  is_worldwide boolean NOT NULL DEFAULT false,
  backlink_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.click_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_result_countries ENABLE ROW LEVEL SECURITY;

-- Policies for click_tracking
CREATE POLICY "Anyone can insert click tracking"
ON public.click_tracking
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view click tracking"
ON public.click_tracking
FOR SELECT
USING (true);

-- Policies for web_result_countries
CREATE POLICY "Public can view country permissions"
ON public.web_result_countries
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert country permissions"
ON public.web_result_countries
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update country permissions"
ON public.web_result_countries
FOR UPDATE
USING (true);

CREATE POLICY "Admins can delete country permissions"
ON public.web_result_countries
FOR DELETE
USING (true);

-- Add trigger for updating updated_at
CREATE TRIGGER update_web_result_countries_updated_at
BEFORE UPDATE ON public.web_result_countries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();