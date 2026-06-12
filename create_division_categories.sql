-- Create the division_categories table
CREATE TABLE IF NOT EXISTS public.division_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_slug VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.division_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on division_categories" 
ON public.division_categories 
FOR SELECT 
USING (true);

-- Allow authenticated users (admin) full access
CREATE POLICY "Allow authenticated users full access on division_categories" 
ON public.division_categories 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Seed Initial Data for Tiles
INSERT INTO public.division_categories (page_slug, name, image_url, display_order) VALUES
('tiles', 'Living Room', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', 1),
('tiles', 'Bathroom', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80', 2),
('tiles', 'Kitchen', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80', 3),
('tiles', 'Outdoor', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', 4),
('tiles', 'Commercial', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80', 5),
('tiles', 'Parking', 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80', 6);

-- Seed Initial Data for Bath Fittings
INSERT INTO public.division_categories (page_slug, name, image_url, display_order) VALUES
('bath-fittings', 'Faucets & Taps', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80', 1),
('bath-fittings', 'Sanitaryware', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80', 2),
('bath-fittings', 'Wellness & Tubs', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', 3),
('bath-fittings', 'Shower Systems', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', 4),
('bath-fittings', 'Water Heaters', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80', 5),
('bath-fittings', 'Bath Accessories', 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80', 6);

-- Seed Initial Data for Doors
INSERT INTO public.division_categories (page_slug, name, image_url, display_order) VALUES
('doors', 'Main Entry Doors', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80', 1),
('doors', 'Bedroom Doors', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=400&q=80', 2),
('doors', 'Toilet & Bath Doors', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80', 3),
('doors', 'Safety Steel Doors', 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=400&q=80', 4),
('doors', 'Steel Windows', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80', 5),
('doors', 'Double Leaf Doors', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=400&q=80', 6);
