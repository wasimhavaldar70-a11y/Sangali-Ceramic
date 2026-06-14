-- =========================================================================================
-- SANGALI CERAMIC - MASTER SQL SETUP SCRIPT
-- =========================================================================================
-- Run this script in your Supabase SQL Editor to initialize the entire database.
-- It safely creates all tables, adds relationships, inserts initial seed data,
-- configures Row Level Security (RLS) policies, and creates Storage buckets.
-- =========================================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================================
-- PART 1: BASE SCHEMA (from schema.sql)
-- =========================================================================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE,
    size VARCHAR(100) NOT NULL,
    finish VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    images TEXT[] NOT NULL,
    description TEXT,
    tech_specs JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image VARCHAR(1024) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    image_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dealers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    coords JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catalogues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    pdf_url VARCHAR(1024) NOT NULL,
    thumbnail_url VARCHAR(1024) NOT NULL,
    file_size VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    message TEXT,
    extra_data JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    url VARCHAR(1024) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_dealers_state ON dealers(state);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- =========================================================================================
-- PART 2: ADDITIONAL TABLES & SEED DATA
-- =========================================================================================

-- Product Divisions
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

-- Division Categories
CREATE TABLE IF NOT EXISTS public.division_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_slug VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Link products to division_categories
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS division_category_id UUID REFERENCES public.division_categories(id) ON DELETE SET NULL;

-- Brand Logos
CREATE TABLE IF NOT EXISTS public.brand_logos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================================
-- PART 3: ALTERATIONS (from rls_and_updates.sql)
-- =========================================================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'quotation_sent', 'negotiation', 'won', 'lost'));

ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS applications TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published';

-- =========================================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY (RLS)
-- =========================================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.division_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_logos ENABLE ROW LEVEL SECURITY;

-- =========================================================================================
-- PART 5: CONFIGURE RLS POLICIES
-- =========================================================================================

-- Public Read Policies
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public can read published projects" ON projects FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read dealers" ON dealers FOR SELECT USING (true);
CREATE POLICY "Public can read catalogues" ON catalogues FOR SELECT USING (true);
CREATE POLICY "Public can read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Public can read hero slides" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "Public can read product divisions" ON product_divisions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on division_categories" ON public.division_categories FOR SELECT USING (true);
CREATE POLICY "Public can read brand logos" ON public.brand_logos FOR SELECT USING (true);

-- Public Insert Policies (for Leads)
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);

-- Authenticated Users (Admin) Full Access Policies
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage collections" ON collections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage dealers" ON dealers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage catalogues" ON catalogues FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage leads" ON leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage hero slides" ON hero_slides FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage product divisions" ON product_divisions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access on division_categories" ON public.division_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage brand logos" ON public.brand_logos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================================================
-- PART 6: STORAGE BUCKETS SETUP
-- =========================================================================================

-- Safely insert buckets required for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('catalogues', 'catalogues', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('dealers', 'dealers', true) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for 'products' bucket
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );
CREATE POLICY "Admin Upload Products" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Update Products" ON storage.objects FOR UPDATE USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Delete Products" ON storage.objects FOR DELETE USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- Storage RLS Policies for 'projects' bucket
CREATE POLICY "Public Access Projects" ON storage.objects FOR SELECT USING ( bucket_id = 'projects' );
CREATE POLICY "Admin Upload Projects" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'projects' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Update Projects" ON storage.objects FOR UPDATE USING ( bucket_id = 'projects' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Delete Projects" ON storage.objects FOR DELETE USING ( bucket_id = 'projects' AND auth.role() = 'authenticated' );

-- Storage RLS Policies for 'catalogues' bucket
CREATE POLICY "Public Access Catalogues" ON storage.objects FOR SELECT USING ( bucket_id = 'catalogues' );
CREATE POLICY "Admin Upload Catalogues" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'catalogues' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Update Catalogues" ON storage.objects FOR UPDATE USING ( bucket_id = 'catalogues' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Delete Catalogues" ON storage.objects FOR DELETE USING ( bucket_id = 'catalogues' AND auth.role() = 'authenticated' );

-- Storage RLS Policies for 'dealers' bucket
CREATE POLICY "Public Access Dealers" ON storage.objects FOR SELECT USING ( bucket_id = 'dealers' );
CREATE POLICY "Admin Upload Dealers" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'dealers' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Update Dealers" ON storage.objects FOR UPDATE USING ( bucket_id = 'dealers' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Delete Dealers" ON storage.objects FOR DELETE USING ( bucket_id = 'dealers' AND auth.role() = 'authenticated' );
