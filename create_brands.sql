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
('Jaquar', NULL, 1),
('Artize', NULL, 2),
('Fenesta', NULL, 3),
('Johnson', NULL, 4),
('Nitco', NULL, 5),
('Oasis', NULL, 6),
('Essco', NULL, 7),
('Tata Pravesh', NULL, 8),
('RAK Ceramics', NULL, 9),
('Franke', NULL, 10),
('Carysil', NULL, 11),
('Antiek', NULL, 12),
('Nirali BG', NULL, 13),
('Ardex Endura', NULL, 14);
