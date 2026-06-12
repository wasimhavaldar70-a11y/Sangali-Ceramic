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

export interface HeroSlide {
  id: string;
  url: string;
  title: string;
  subtitle: string;
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
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (isMock) {
      // Return file as base64 data URL
      return new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }

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
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const defaults: Project[] = [
      {
        id: 'proj-1',
        title: 'The Grand Heritage Villa',
        slug: 'the-grand-heritage-villa',
        category: 'Villas',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        description: 'Luxury travertine floors and custom marble wall panels styled for a modern classical aesthetic.',
        location: 'Pune, Maharashtra',
        year: 2025,
        is_featured: true,
        status: 'published'
      },
      {
        id: 'proj-2',
        title: 'Skyline Penthouse Suites',
        slug: 'skyline-penthouse-suites',
        category: 'Apartments',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
        description: 'Large-format glazed vitrified slabs with seamless edge profiles across kitchen and living spaces.',
        location: 'Mumbai, Maharashtra',
        year: 2024,
        is_featured: true,
        status: 'published'
      },
      {
        id: 'proj-3',
        title: 'Opal Wellness Resort',
        slug: 'opal-wellness-resort',
        category: 'Hotels',
        image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
        description: 'Premium anti-skid wooden textured tile decks and complete luxury bath fittings from Jaquar wellness systems.',
        location: 'Calangute, Goa',
        year: 2025,
        is_featured: true,
        status: 'published'
      }
    ];

    if (isMock) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('mock_projects');
        if (local) {
          return JSON.parse(local);
        }
        localStorage.setItem('mock_projects', JSON.stringify(defaults));
      }
      return defaults;
    } else {
      const supabase = createClient();
      const { data, error } = await supabase.from('projects').select('*');
      if (!error && data && data.length > 0) {
        return data;
      }
      
      // If table is empty and there's no DB error, seed default projects into the database
      if (!error && data && data.length === 0) {
        try {
          const seedData = defaults.map(({ id, ...rest }) => rest);
          const { data: seeded, error: seedError } = await supabase.from('projects').insert(seedData).select();
          if (!seedError && seeded && seeded.length > 0) {
            return seeded;
          }
        } catch (seedErr) {
          console.error('Failed to seed default projects:', seedErr);
        }
      }
    }

    return defaults;
  },

  async saveProject(project: Partial<Project>): Promise<Project | null> {
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (isMock) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('mock_projects');
        let current: Project[] = local ? JSON.parse(local) : [];
        if (current.length === 0) {
          current = await this.getProjects();
        }
        
        const toSave = { ...project } as Project;
        if (!toSave.id) {
          toSave.id = 'proj-' + Date.now();
        }
        if (!toSave.slug) {
          toSave.slug = toSave.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }
        
        const index = current.findIndex(p => p.id === toSave.id);
        if (index >= 0) {
          current[index] = toSave;
        } else {
          current.push(toSave);
        }
        
        localStorage.setItem('mock_projects', JSON.stringify(current));
        return toSave;
      }
      return null;
    }

    const supabase = createClient();
    if (project.id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(project.id);
      if (!isUuid) {
        delete project.id;
      }
    }
    const { data, error } = await supabase.from('projects').upsert(project).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteProject(id: string): Promise<boolean> {
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (isMock) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('mock_projects');
        if (local) {
          const current: Project[] = JSON.parse(local);
          const filtered = current.filter(p => p.id !== id);
          localStorage.setItem('mock_projects', JSON.stringify(filtered));
          return true;
        }
      }
      return false;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      // If it's not a valid UUID, it can't be in the database, so deletion is successful (no-op)
      return true;
    }

    const supabase = createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error(error);
      return false;
    }
    return true;
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
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (isMock) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('mock_product_divisions');
        if (local) {
          return JSON.parse(local);
        }
      }
    } else {
      const supabase = createClient();
      const { data, error } = await supabase.from('product_divisions').select('*').order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data;
      }
    }

    const defaults = [
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
        title: 'Luxury Bathroom Products',
        heading: 'Authorized Seller of Jaquar Group',
        description: 'Upgrade your spaces with luxury bath fittings, sanitaryware, wellness systems, designer showers, and sleek solutions from the premium Jaquar Group.',
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

    if (isMock && typeof window !== 'undefined') {
      localStorage.setItem('mock_product_divisions', JSON.stringify(defaults));
    }
    return defaults;
  },

  async saveDivision(division: Partial<ProductDivision>): Promise<ProductDivision | null> {
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (isMock) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('mock_product_divisions');
        let current: ProductDivision[] = local ? JSON.parse(local) : [];
        if (current.length === 0) {
          current = await this.getDivisions();
        }
        
        const toSave = { ...division } as ProductDivision;
        if (!toSave.id) {
          toSave.id = 'div-' + Date.now();
        }
        
        const index = current.findIndex(d => d.id === toSave.id);
        if (index >= 0) {
          current[index] = toSave;
        } else {
          current.push(toSave);
        }
        
        localStorage.setItem('mock_product_divisions', JSON.stringify(current));
        return toSave;
      }
      return null;
    }

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
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (isMock) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('mock_product_divisions');
        if (local) {
          const current: ProductDivision[] = JSON.parse(local);
          const filtered = current.filter(d => d.id !== id);
          localStorage.setItem('mock_product_divisions', JSON.stringify(filtered));
          return true;
        }
      }
      return false;
    }

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
  },

  // Hero Slides
  async getHeroSlides(): Promise<HeroSlide[]> {
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (isMock) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('mock_hero_slides');
        if (local) {
          return JSON.parse(local);
        }
      }
    } else {
      const supabase = createClient();
      const { data, error } = await supabase.from('hero_slides').select('*').order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data;
      }
    }

    const defaults = [
      {
        id: 'slide-1',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=90',
        title: 'Grand Marble Luxury',
        subtitle: 'Calacatta Glazed Vitrified Slabs',
        display_order: 1
      },
      {
        id: 'slide-2',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=90',
        title: 'Warm Architectural Woods',
        subtitle: 'Natural Woodgrain Planks Collection',
        display_order: 2
      },
      {
        id: 'slide-3',
        url: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1920&q=90',
        title: 'Rustic Raw Stone',
        subtitle: 'Contemporary Slate & Stone Textures',
        display_order: 3
      }
    ];

    if (isMock && typeof window !== 'undefined') {
      localStorage.setItem('mock_hero_slides', JSON.stringify(defaults));
    }
    return defaults;
  },

  async saveHeroSlide(slide: Partial<HeroSlide>): Promise<HeroSlide | null> {
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (isMock) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('mock_hero_slides');
        let current: HeroSlide[] = local ? JSON.parse(local) : [];
        if (current.length === 0) {
          current = await this.getHeroSlides();
        }
        
        const toSave = { ...slide } as HeroSlide;
        if (!toSave.id) {
          toSave.id = 'slide-' + Date.now();
        }
        
        const index = current.findIndex(s => s.id === toSave.id);
        if (index >= 0) {
          current[index] = toSave;
        } else {
          current.push(toSave);
        }
        
        localStorage.setItem('mock_hero_slides', JSON.stringify(current));
        return toSave;
      }
      return null;
    }

    const supabase = createClient();
    if (slide.id && slide.id.startsWith('slide-')) delete slide.id;
    const { data, error } = await supabase.from('hero_slides').upsert(slide).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteHeroSlide(id: string): Promise<boolean> {
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (isMock) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('mock_hero_slides');
        if (local) {
          const current: HeroSlide[] = JSON.parse(local);
          const filtered = current.filter(s => s.id !== id);
          localStorage.setItem('mock_hero_slides', JSON.stringify(filtered));
          return true;
        }
      }
      return false;
    }

    const supabase = createClient();
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  }
};
