-- 1. Add new columns to 'leads' for the CRM Pipeline
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Ensure status can be the new CRM states
-- 'new', 'contacted', 'quotation_sent', 'negotiation', 'won', 'lost'
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'quotation_sent', 'negotiation', 'won', 'lost'));

-- 2. Add SEO & extra fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS applications TEXT[]; -- e.g., ['Living Room', 'Bathroom']
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 3. Add SEO & extra fields to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published';

-- 4. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Public can read published data
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public can read published projects" ON projects FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read dealers" ON dealers FOR SELECT USING (true);
CREATE POLICY "Public can read catalogues" ON catalogues FOR SELECT USING (true);
CREATE POLICY "Public can read testimonials" ON testimonials FOR SELECT USING (true);

-- Public can INSERT leads, but not read them
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);

-- Authenticated Users (Admins) can do everything
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage collections" ON collections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage dealers" ON dealers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage catalogues" ON catalogues FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage leads" ON leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- 6. Storage Policies
-- Make sure buckets exist (products, projects, catalogues, dealers)
-- Storage Policies for 'products' bucket
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );
CREATE POLICY "Admin Upload Products" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Update Products" ON storage.objects FOR UPDATE USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Delete Products" ON storage.objects FOR DELETE USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- Repeat for 'projects', 'catalogues', 'dealers'
CREATE POLICY "Public Access Projects" ON storage.objects FOR SELECT USING ( bucket_id = 'projects' );
CREATE POLICY "Admin Upload Projects" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'projects' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Update Projects" ON storage.objects FOR UPDATE USING ( bucket_id = 'projects' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Delete Projects" ON storage.objects FOR DELETE USING ( bucket_id = 'projects' AND auth.role() = 'authenticated' );

CREATE POLICY "Public Access Catalogues" ON storage.objects FOR SELECT USING ( bucket_id = 'catalogues' );
CREATE POLICY "Admin Upload Catalogues" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'catalogues' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Update Catalogues" ON storage.objects FOR UPDATE USING ( bucket_id = 'catalogues' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Delete Catalogues" ON storage.objects FOR DELETE USING ( bucket_id = 'catalogues' AND auth.role() = 'authenticated' );

CREATE POLICY "Public Access Dealers" ON storage.objects FOR SELECT USING ( bucket_id = 'dealers' );
CREATE POLICY "Admin Upload Dealers" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'dealers' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Update Dealers" ON storage.objects FOR UPDATE USING ( bucket_id = 'dealers' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Delete Dealers" ON storage.objects FOR DELETE USING ( bucket_id = 'dealers' AND auth.role() = 'authenticated' );
