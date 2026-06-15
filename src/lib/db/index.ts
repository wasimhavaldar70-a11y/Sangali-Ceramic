import { createBrowserClient } from '@supabase/ssr';

// Define the environment variables explicitly to ensure Next.js exposes them
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    // Return a mocked client if credentials are missing to prevent build failures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Proxy({} as any, {
      get(target, prop) {
        if (prop === 'auth') {
          return {
            getUser: async () => ({ data: { user: null }, error: null }),
            signOut: async () => {},
            signInWithPassword: async () => ({ data: { user: null }, error: null })
          };
        }
        if (prop === 'from') {
          return () => ({
            select: () => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const queryResult = Promise.resolve({ data: [], error: null }) as any;
              queryResult.order = () => queryResult;
              queryResult.single = () => Promise.resolve({ data: null, error: null });
              queryResult.eq = () => queryResult;
              return queryResult;
            },
            upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            update: () => ({ eq: () => Promise.resolve({ error: null }) }),
            or: () => Promise.resolve({ data: [], error: null })
          });
        }
        if (prop === 'storage') {
          return {
            from: () => ({
              upload: () => Promise.resolve({ data: null, error: null }),
              remove: () => Promise.resolve({ data: null, error: null })
            })
          };
        }
        return () => Promise.resolve({ data: null, error: null });
      }
    });
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// --- TYPES ---

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
  image: string;
  images?: string[];
  stock: number;
  is_featured?: boolean;
  status: 'active' | 'draft' | 'out_of_stock';
  features?: string[];
  specifications?: Record<string, string>;
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
  gallery?: string[];
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

export interface HeroSlide {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  display_order: number;
  created_at?: string;
}

// --- DB SERVICE ---

export const dbService = {
  // Auth
  async getCurrentUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
  },

  // Storage / Files
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

  async uploadVideo(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `video_${Date.now()}.${ext}`;
    return this.uploadFile('videos', file, path);
  },

  async uploadHeroSlide(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `slide_${Date.now()}.${ext}`;
    return this.uploadFile('products', file, path);
  },

  async uploadBrandLogo(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `brand_${Date.now()}.${ext}`;
    return this.uploadFile('products', file, path);
  },

  async deleteFile(url: string, bucket = 'products'): Promise<boolean> {
    const supabase = createClient();
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const { error } = await supabase.storage.from(bucket).remove([fileName]);
      if (error) {
        console.error('Failed to delete file from storage:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error parsing file URL for deletion:', e);
      return false;
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('categories').select('*');
    if (error) console.error(error);
    return data || [];
  },

  async saveCategory(category: Partial<Category>): Promise<Category | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('categories').upsert(category).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Collections
  async getCollections(): Promise<Collection[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('collections').select('*');
    if (error) console.error(error);
    return data || [];
  },

  // Products
  async getProducts(searchQuery?: string, divisionCategoryId?: string, categoryId?: string): Promise<Product[]> {
    const supabase = createClient();
    let query = supabase.from('products').select('*');
    
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
    }
    if (divisionCategoryId) {
      query = query.eq('division_category_id', divisionCategoryId);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    if (error) console.error(error);
    return data || [];
  },

  async getProductById(id: string): Promise<Product | null> {
    const supabase = createClient();
    // Assuming slug is stored in id for products or we use id as slug
    // We should check what the field is. Looking at the error it was passed `slug`
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async saveProduct(product: Partial<Product>): Promise<Product | null> {
    const supabase = createClient();
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
    if (error) console.error('Error fetching projects:', error);
    return data || [];
  },

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).single();
    if (error) {
      console.error('Error fetching project by slug:', error);
      return null;
    }
    return data;
  },

  async saveProject(project: Partial<Project>): Promise<Project | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('projects').upsert(project).select().single();
    if (error) {
      console.error('Error saving project:', error);
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
    if (error) console.error('Error fetching testimonials:', error);
    return data || [];
  },

  async saveTestimonial(testimonial: Partial<Testimonial>): Promise<Testimonial | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('testimonials').upsert(testimonial).select().single();
    if (error) {
      console.error('Failed to save testimonial:', error);
      throw error;
    }
    return data;
  },

  async deleteTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete testimonial:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
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

  async saveCatalogue(catalogue: Partial<Catalogue>): Promise<Catalogue | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('catalogues').upsert(catalogue).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteCatalogue(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from('catalogues').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
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

  async saveLead(lead: Partial<Lead>): Promise<Lead | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('leads').upsert(lead).select().single();
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

  async deleteLead(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Product Divisions
  async getDivisions(): Promise<ProductDivision[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('product_divisions').select('*').order('display_order', { ascending: true });
    if (error) console.error('Error fetching divisions:', error);
    return data || [];
  },

  async saveDivision(division: Partial<ProductDivision>): Promise<ProductDivision | null> {
    const supabase = createClient();
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
    if (error) console.error('Error fetching division categories:', error);
    return data || [];
  },

  async getDivisionCategoryById(id: string): Promise<DivisionCategory | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('division_categories').select('*').eq('id', id).single();
    if (error) {
      console.error('Error fetching division category by id:', error);
      return null;
    }
    return data;
  },

  async saveDivisionCategory(category: Partial<DivisionCategory>): Promise<DivisionCategory | null> {
    const supabase = createClient();
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
    if (error) console.error('Error fetching brand logos:', error);
    return data || [];
  },

  async saveBrand(brand: Partial<BrandLogo>): Promise<BrandLogo | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('brand_logos').upsert(brand).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteBrand(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    const { error } = await supabase.from('brand_logos').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete brand:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  // Hero Slides
  async getHeroSlides(): Promise<HeroSlide[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('hero_slides').select('*').order('display_order', { ascending: true });
    if (error) console.error('Error fetching hero slides:', error);
    return data || [];
  },

  async saveHeroSlide(slide: Partial<HeroSlide>): Promise<HeroSlide | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('hero_slides').upsert(slide).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteHeroSlide(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete hero slide:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
};
