-- Create product_divisions table
CREATE TABLE IF NOT EXISTS product_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_text VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  heading VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  link_text VARCHAR(255) NOT NULL,
  link_url VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE product_divisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read product divisions" ON product_divisions FOR SELECT USING (true);
CREATE POLICY "Admins can manage product divisions" ON product_divisions FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial data
INSERT INTO product_divisions (badge_text, title, heading, description, link_text, link_url, image_url, display_order)
VALUES
(
  'Core Collection',
  'Premium Tiles',
  'Find The Perfect Tile For Every Space',
  'Discover our curated vitrified slabs, marble textures, and designer ceramic collections crafted for modern spaces and elite architectures.',
  'Explore Tiles',
  '/tiles',
  '/premium-tiles.jpg',
  1
),
(
  'Authorized Seller',
  'Luxury Sanitaryware',
  'Authorized Seller of Jaquar Group',
  'Upgrade your spaces with luxury sanitaryware, wellness systems, designer showers, and sleek fittings from the premium Jaquar Group.',
  'Explore Bath',
  '/bath-fittings',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
  2
),
(
  'Official Distributor',
  'Tata Pravesh Doors',
  'Distributor in Western Maharashtra & Goa',
  'Official distributor of Tata Pravesh doors in Western Maharashtra and Goa. Experience the unyielding strength of steel combined with the elegant wooden finish.',
  'Explore Tata Doors',
  '/doors',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  3
);
