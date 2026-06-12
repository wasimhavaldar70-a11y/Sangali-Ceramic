-- Add division_category_id to products table
ALTER TABLE public.products
ADD COLUMN division_category_id UUID REFERENCES public.division_categories(id) ON DELETE SET NULL;

-- Update RLS policies (optional, but good practice if needed, 
-- though products table already has RLS set up likely. We'll ensure it allows read)
