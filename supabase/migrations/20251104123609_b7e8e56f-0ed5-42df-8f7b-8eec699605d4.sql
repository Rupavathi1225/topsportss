-- Create landing_page table for hero content
CREATE TABLE public.landing_page (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'TopSportsWin - Your Sports Journey Starts Here',
  description TEXT NOT NULL DEFAULT 'Discover the best sports content worldwide. Whether you''re looking for live scores, fantasy leagues, betting tips, or professional development opportunities, we help you find the perfect platform to achieve your sports goals.',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create related_categories table
CREATE TABLE public.related_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  serial_number INTEGER NOT NULL UNIQUE,
  web_result_page INTEGER NOT NULL DEFAULT 1 CHECK (web_result_page >= 1 AND web_result_page <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create web_results table (for both sponsored and regular results)
CREATE TABLE public.web_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  web_result_page INTEGER NOT NULL CHECK (web_result_page >= 1 AND web_result_page <= 5),
  is_sponsored BOOLEAN NOT NULL DEFAULT false,
  offer_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  original_link TEXT NOT NULL,
  logo_url TEXT,
  serial_number INTEGER NOT NULL,
  imported_from TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(web_result_page, is_sponsored, serial_number)
);

-- Create link_redirects table for masked links
CREATE TABLE public.link_redirects (
  id SERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default landing page content
INSERT INTO public.landing_page (title, description) VALUES (
  'TopSportsWin - Your Sports Journey Starts Here',
  'Discover the best sports content worldwide. Whether you''re looking for live scores, fantasy leagues, betting tips, or professional development opportunities, we help you find the perfect platform to achieve your sports goals.'
);

-- Insert default categories
INSERT INTO public.related_categories (title, serial_number, web_result_page) VALUES
  ('Top Fantasy Sports Platforms', 1, 1),
  ('Live Sports Streaming Services', 2, 2),
  ('Sports Betting Sites Worldwide', 3, 3),
  ('Sports Analytics Tools', 4, 4),
  ('Fitness & Training Apps', 5, 5);

-- Enable Row Level Security
ALTER TABLE public.landing_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.related_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_redirects ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view landing page" ON public.landing_page FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON public.related_categories FOR SELECT USING (true);
CREATE POLICY "Public can view web results" ON public.web_results FOR SELECT USING (true);
CREATE POLICY "Public can view link redirects" ON public.link_redirects FOR SELECT USING (true);

-- Create policies for authenticated admin updates (we'll add auth later)
CREATE POLICY "Admins can update landing page" ON public.landing_page FOR UPDATE USING (true);
CREATE POLICY "Admins can insert categories" ON public.related_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update categories" ON public.related_categories FOR UPDATE USING (true);
CREATE POLICY "Admins can delete categories" ON public.related_categories FOR DELETE USING (true);
CREATE POLICY "Admins can insert web results" ON public.web_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update web results" ON public.web_results FOR UPDATE USING (true);
CREATE POLICY "Admins can delete web results" ON public.web_results FOR DELETE USING (true);
CREATE POLICY "Admins can insert link redirects" ON public.link_redirects FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_landing_page_updated_at
BEFORE UPDATE ON public.landing_page
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.related_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_web_results_updated_at
BEFORE UPDATE ON public.web_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();