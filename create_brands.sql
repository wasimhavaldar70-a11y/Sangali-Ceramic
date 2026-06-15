-- Create brand_logos table
CREATE TABLE IF NOT EXISTS public.brand_logos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.brand_logos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read brand logos" 
ON public.brand_logos 
FOR SELECT 
USING (true);

-- Allow authenticated users (admin) full access
CREATE POLICY "Admins can manage brand logos" 
ON public.brand_logos 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Seed Initial Data for Partner Brands
-- Since some brands have complex inline SVG structures in the default UI,
-- they can start with logo_url as NULL, and page.tsx will fallback to their customized SVGs.
-- Admins can upload custom image logos to override them anytime.
INSERT INTO public.brand_logos (name, logo_url, display_order) VALUES
('Jaquar', 'https://logo.clearbit.com/jaquar.com', 1),
('Artize', 'https://logo.clearbit.com/artize.com', 2),
('Fenesta', 'https://logo.clearbit.com/fenesta.com', 3),
('Johnson', 'https://logo.clearbit.com/hrjohnsonindia.com', 4),
('Nitco', 'https://logo.clearbit.com/nitco.in', 5),
('Oasis', 'https://logo.clearbit.com/oasistiles.in', 6),
('Essco', 'https://logo.clearbit.com/esscobathware.com', 7),
('Tata Pravesh', 'https://logo.clearbit.com/tatapravesh.com', 8),
('RAK Ceramics', 'https://logo.clearbit.com/rakceramics.com', 9),
('Franke', 'https://logo.clearbit.com/franke.com', 10),
('Carysil', 'https://logo.clearbit.com/carysil.com', 11),
('Antiek', 'https://logo.clearbit.com/antiek.com', 12),
('Nirali BG', 'https://logo.clearbit.com/niralibg.com', 13),
('Ardex Endura', 'https://logo.clearbit.com/ardexendura.com', 14);
