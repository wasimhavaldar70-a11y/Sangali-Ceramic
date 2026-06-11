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
  category_id: string;
  collection_id: string;
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
  async getProducts(query?: string): Promise<Product[]> {
    const supabase = createClient();
    let dbQuery = supabase.from('products').select('*');
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%,finish.ilike.%${query}%`);
    }
    const { data, error } = await dbQuery;
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
    return data || [];
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
  }
};
