-- Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    url VARCHAR(1024) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can read hero slides" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "Admins can manage hero slides" ON hero_slides FOR ALL USING (auth.role() = 'authenticated');
