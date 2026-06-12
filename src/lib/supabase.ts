import { createClient } from '@/lib/supabase/client';

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  size: string;
  finish: string;
  price: number;
  category_id?: string;
  collection_id?: string;
  division_category_id?: string;
  images: string[];
  description?: string;
  tech_specs?: {
    water_absorption?: string;
    hardness?: string;
    thickness?: string;
    modulus_of_rupture?: string;
    abrasion_resistance?: string;
  };
  status: 'active' | 'draft';
  created_at?: string;
  meta_title?: string;
  meta_description?: string;
  applications?: string[];
  is_featured?: boolean;
}

export interface Project {
  id: string;
  title: string;
  slug?: string;
  category: 'Villas' | 'Apartments' | 'Hotels' | 'Offices' | 'Restaurants';
  image: string;
  description?: string;
  location?: string;
  year?: number;
  is_featured?: boolean;
  status?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  image_url?: string;
}

export interface Dealer {
  id: string;
  name: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  email?: string;
  coords?: { lat: number; lng: number };
}

export interface Catalogue {
  id: string;
  title: string;
  pdf_url: string;
  thumbnail_url: string;
  file_size?: string;
}

export interface Lead {
  id: string;
  type: 'quote' | 'consultation' | 'catalogue' | 'dealer_request' | 'whatsapp' | 'contact';
  name: string;
  email?: string;
  phone: string;
  message?: string;
  extra_data?: Record<string, unknown> | null;
  status: 'new' | 'contacted' | 'quotation_sent' | 'negotiation' | 'won' | 'lost';
  created_at: string;
  assigned_to?: string;
  notes?: string;
  last_contacted_at?: string;
}

export interface ProductDivision {
  id: string;
  badge_text: string;
  title: string;
  heading: string;
  description: string;
  link_text: string;
  link_url: string;
  image_url: string;
  display_order: number;
  created_at?: string;
}

export interface DivisionCategory {
  id: string;
  page_slug: string;
  name: string;
  image_url: string;
  display_order: number;
  created_at?: string;
}

export interface BrandLogo {
  id: string;
  name: string;
  logo_url?: string;
  display_order: number;
  created_at?: string;
}

// Database APIs
export const dbService = {
  // Authentication (Uses Supabase SSR)
  async getUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  async logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
  },

  // Storage
  async uploadFile(bucket: string, file: File, path: string): Promise<string | null> {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true
    });
    
    if (error) {
      console.error('Upload Error:', error);
      return null;
    }
    
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('categories').select('*');
    if (error) console.error(error);
    return data || [];
  },

  // Collections
  async getCollections(): Promise<Collection[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('collections').select('*');
    if (error) console.error(error);
    return data || [];
  },

  // Products
  async getProducts(searchQuery?: string, divisionCategoryId?: string): Promise<Product[]> {
    const supabase = createClient();
    let query = supabase.from('products').select('*');
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
    }
    if (divisionCategoryId) {
      query = query.eq('division_category_id', divisionCategoryId);
    }
    const { data, error } = await query;
    if (error) console.error(error);
    return data || [];
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const supabase = createClient();
    const { data, error } = await supabase.from('products')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();
    if (error) console.error(error);
    return data || undefined;
  },

  async saveProduct(product: Partial<Product>): Promise<Product | null> {
    const supabase = createClient();
    // remove id if it starts with 'prod-' (mock id) to let UUID auto-generate
    if (product.id && product.id.startsWith('prod-')) {
      delete product.id;
    }
    const { data, error } = await supabase.from('products').upsert(product).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('projects').select('*');
    if (error) console.error(error);
    return data || [];
  },

  async saveProject(project: Partial<Project>): Promise<Project | null> {
    const supabase = createClient();
    if (project.id && project.id.startsWith('proj-')) delete project.id;
    const { data, error } = await supabase.from('projects').upsert(project).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteProject(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('testimonials').select('*');
    if (error) console.error(error);
    return data || [];
  },

  // Dealers
  async getDealers(): Promise<Dealer[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('dealers').select('*');
    if (error) console.error(error);
    return data || [];
  },

  async saveDealer(dealer: Partial<Dealer>): Promise<Dealer | null> {
    const supabase = createClient();
    if (dealer.id && dealer.id.startsWith('deal-')) delete dealer.id;
    const { data, error } = await supabase.from('dealers').upsert(dealer).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteDealer(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from('dealers').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Catalogues
  async getCatalogues(): Promise<Catalogue[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('catalogues').select('*');
    if (error) console.error(error);
    return data || [];
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    return data || [];
  },

  async insertLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('leads').insert(lead).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async updateLeadStatus(id: string, status: Lead['status'], notes?: string): Promise<boolean> {
    const supabase = createClient();
    const updatePayload: Record<string, unknown> = { status };
    if (notes !== undefined) updatePayload.notes = notes;
    
    const { error } = await supabase.from('leads').update(updatePayload).eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Product Divisions
  async getDivisions(): Promise<ProductDivision[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('product_divisions').select('*').order('display_order', { ascending: true });
    if (error) console.error(error);
    if (data && data.length > 0) {
      return data;
    }
    return [
      {
        id: 'div-tiles',
        badge_text: 'Core Collection',
        title: 'Premium Tiles',
        heading: 'Find The Perfect Tile For Every Space',
        description: 'Discover our curated vitrified slabs, marble textures, and designer ceramic collections crafted for modern spaces and elite architectures.',
        link_text: 'Explore Tiles',
        link_url: '/tiles',
        image_url: '/premium-tiles.jpg',
        display_order: 1
      },
      {
        id: 'div-bath',
        badge_text: 'Authorized Seller',
        title: 'Luxury Sanitaryware',
        heading: 'Authorized Seller of Jaquar Group',
        description: 'Upgrade your spaces with luxury sanitaryware, wellness systems, designer showers, and sleek fittings from the premium Jaquar Group.',
        link_text: 'Explore Bath',
        link_url: '/bath-fittings',
        image_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
        display_order: 2
      },
      {
        id: 'div-doors',
        badge_text: 'Official Distributor',
        title: 'Tata Pravesh Doors',
        heading: 'Distributor in Western Maharashtra & Goa',
        description: 'Official distributor of Tata Pravesh doors in Western Maharashtra and Goa. Experience the unyielding strength of steel combined with the elegant wooden finish.',
        link_text: 'Explore Tata Doors',
        link_url: '/doors',
        image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        display_order: 3
      }
    ];
  },

  async saveDivision(division: Partial<ProductDivision>): Promise<ProductDivision | null> {
    const supabase = createClient();
    if (division.id && division.id.startsWith('div-')) delete division.id;
    const { data, error } = await supabase.from('product_divisions').upsert(division).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteDivision(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from('product_divisions').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Division Categories
  async getDivisionCategories(pageSlug?: string): Promise<DivisionCategory[]> {
    const supabase = createClient();
    let query = supabase.from('division_categories').select('*').order('display_order', { ascending: true });
    if (pageSlug) {
      query = query.eq('page_slug', pageSlug);
    }
    const { data, error } = await query;
    if (error) console.error(error);
    return data || [];
  },

  async getDivisionCategoryById(id: string): Promise<DivisionCategory | undefined> {
    const supabase = createClient();
    const { data, error } = await supabase.from('division_categories').select('*').eq('id', id).single();
    if (error) console.error(error);
    return data || undefined;
  },

  async saveDivisionCategory(category: Partial<DivisionCategory>): Promise<DivisionCategory | null> {
    const supabase = createClient();
    if (category.id && category.id.startsWith('cat-')) delete category.id;
    const { data, error } = await supabase.from('division_categories').upsert(category).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteDivisionCategory(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from('division_categories').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Brand Logos
  async getBrands(): Promise<BrandLogo[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('brand_logos').select('*').order('display_order', { ascending: true });
    if (error) console.error(error);
    if (data && data.length > 0) {
      return data;
    }
    // Fallback list of default brands in the exact display order
    return [
      { id: 'b-1', name: 'Jaquar', display_order: 1 },
      { id: 'b-2', name: 'Artize', display_order: 2 },
      { id: 'b-3', name: 'Fenesta', display_order: 3 },
      { id: 'b-4', name: 'Johnson', display_order: 4 },
      { id: 'b-5', name: 'Nitco', display_order: 5 },
      { id: 'b-6', name: 'Oasis', display_order: 6 },
      { id: 'b-7', name: 'Essco', display_order: 7 },
      { id: 'b-8', name: 'Tata Pravesh', display_order: 8 },
      { id: 'b-9', name: 'RAK Ceramics', display_order: 9 },
      { id: 'b-10', name: 'Franke', display_order: 10 },
      { id: 'b-11', name: 'Carysil', display_order: 11 },
      { id: 'b-12', name: 'Antiek', display_order: 12 },
      { id: 'b-13', name: 'Nirali BG', display_order: 13 },
      { id: 'b-14', name: 'Ardex Endura', display_order: 14 }
    ];
  },

  async saveBrand(brand: Partial<BrandLogo>): Promise<BrandLogo | null> {
    const supabase = createClient();
    if (brand.id && brand.id.startsWith('b-')) delete brand.id;
    const { data, error } = await supabase.from('brand_logos').upsert(brand).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteBrand(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from('brand_logos').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  }
};
