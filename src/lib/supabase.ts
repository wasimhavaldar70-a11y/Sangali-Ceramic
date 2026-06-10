import { createClient } from '@supabase/supabase-js';

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
}

export interface Project {
  id: string;
  title: string;
  category: 'Villas' | 'Apartments' | 'Hotels' | 'Offices' | 'Restaurants';
  image: string;
  description?: string;
  location?: string;
  year?: number;
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
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

// Supabase Init
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Initial Seed Data for local testing and fallback
const seedCategories: Category[] = [
  { id: 'cat-marble', name: 'Marble', slug: 'marble', description: 'Italian and imported marble finishes' },
  { id: 'cat-stone', name: 'Stone', slug: 'stone', description: 'Raw, rustic slate and stone textures' },
  { id: 'cat-wooden', name: 'Wooden', slug: 'wooden', description: 'Warm natural wood grains and plank designs' },
  { id: 'cat-glossy', name: 'Glossy', slug: 'glossy', description: 'High-shine, polished reflective glaze' },
  { id: 'cat-matte', name: 'Matte', slug: 'matte', description: 'Modern, soft non-reflective surfaces' }
];

const seedCollections: Collection[] = [
  { id: 'col-marble', name: 'Marble Collection', slug: 'marble-collection', description: 'Timeless luxury with realistic veining', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80' },
  { id: 'col-wooden', name: 'Wooden Collection', slug: 'wooden-collection', description: 'Rustic warmth combined with vitrified strength', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80' },
  { id: 'col-stone', name: 'Stone Collection', slug: 'stone-collection', description: 'Natural architecture styling', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
  { id: 'col-glossy', name: 'Glossy Collection', slug: 'glossy-collection', description: 'Stunning reflective glaze finishes', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80' },
  { id: 'col-matte', name: 'Matte Collection', slug: 'matte-collection', description: 'Minimalist contemporary surfaces', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80' },
  { id: 'col-large', name: 'Large Format Collection', slug: 'large-format-collection', description: 'Slab sizes for seamless grand layouts', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80' }
];

const seedProducts: Product[] = [
  {
    id: 'prod-calacatta',
    name: 'Calacatta White',
    slug: 'calacatta-white',
    sku: 'CC-WT-001',
    size: '600x1200 mm',
    finish: 'Glossy',
    price: 1299,
    category_id: 'cat-marble',
    collection_id: 'col-marble',
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Calacatta White mimics the world’s most sought-after Italian marble. Elegant, high-fidelity grey veining flows across a pure white base, finished with an ultra-glossy glaze for maximum premium reflection.',
    tech_specs: {
      water_absorption: '< 0.05% (Vitrified)',
      hardness: '6 Mohs',
      thickness: '9.5 mm',
      modulus_of_rupture: '≥ 35 N/mm²',
      abrasion_resistance: 'Class IV'
    },
    status: 'active'
  },
  {
    id: 'prod-royal-beige',
    name: 'Royal Beige',
    slug: 'royal-beige',
    sku: 'RB-BG-002',
    size: '800x1600 mm',
    finish: 'Matte',
    price: 990,
    category_id: 'cat-marble',
    collection_id: 'col-matte',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A warm, premium beige stone effect featuring subtle travertine veining and a silky, soft matte texture. Ideal for creating comfortable yet extremely upscale living areas and corporate spaces.',
    tech_specs: {
      water_absorption: '< 0.05%',
      hardness: '5.5 Mohs',
      thickness: '10 mm',
      modulus_of_rupture: '≥ 38 N/mm²',
      abrasion_resistance: 'Class III'
    },
    status: 'active'
  },
  {
    id: 'prod-carrara',
    name: 'Carrara Grey',
    slug: 'carrara-grey',
    sku: 'CR-GY-003',
    size: '800x1600 mm',
    finish: 'Glossy',
    price: 1490,
    category_id: 'cat-marble',
    collection_id: 'col-large',
    images: [
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A classic dark-veined Carrara grey vitrified slab. Features high-definition webbed patterns that align beautifully across joint lines to deliver a continuous, grand-room feeling.',
    tech_specs: {
      water_absorption: '< 0.04%',
      hardness: '6 Mohs',
      thickness: '10.5 mm',
      modulus_of_rupture: '≥ 40 N/mm²',
      abrasion_resistance: 'Class IV'
    },
    status: 'active'
  },
  {
    id: 'prod-wooden-plank',
    name: 'Wooden Brown',
    slug: 'wooden-brown',
    sku: 'WD-BR-004',
    size: '200x1200 mm',
    finish: 'Matte',
    price: 1090,
    category_id: 'cat-wooden',
    collection_id: 'col-wooden',
    images: [
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Rich, natural-grained wood texture planks with a high-fidelity relief that feels like genuine timber. Resists water, termites, and high impacts, providing wooden beauty with none of the maintenance.',
    tech_specs: {
      water_absorption: '< 0.1%',
      hardness: '7 Mohs',
      thickness: '9.0 mm',
      modulus_of_rupture: '≥ 42 N/mm²',
      abrasion_resistance: 'Class IV'
    },
    status: 'active'
  },
  {
    id: 'prod-stone-grigio',
    name: 'Stone Grigio',
    slug: 'stone-grigio',
    sku: 'ST-GR-005',
    size: '600x1200 mm',
    finish: 'Matte',
    price: 1190,
    category_id: 'cat-stone',
    collection_id: 'col-stone',
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A deep grey textured stone face, capturing slate characteristics. The matte structure provides an excellent grip and premium look for sophisticated high-traffic halls, bathrooms, and patios.',
    tech_specs: {
      water_absorption: '< 0.05%',
      hardness: '6.5 Mohs',
      thickness: '9.8 mm',
      modulus_of_rupture: '≥ 38 N/mm²',
      abrasion_resistance: 'Class IV'
    },
    status: 'active'
  },
  {
    id: 'prod-sahara',
    name: 'Sahara Crema',
    slug: 'sahara-crema',
    sku: 'SH-CR-006',
    size: '600x1200 mm',
    finish: 'Glossy',
    price: 1100,
    category_id: 'cat-glossy',
    collection_id: 'col-glossy',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Soft beige, dune-like marble swirls. This glazed tile reflects light beautifully to widen corridors, luxury bathroom settings, and majestic dining spaces.',
    tech_specs: {
      water_absorption: '< 0.05%',
      hardness: '5.5 Mohs',
      thickness: '9.2 mm',
      modulus_of_rupture: '≥ 35 N/mm²',
      abrasion_resistance: 'Class III'
    },
    status: 'active'
  }
];

const seedProjects: Project[] = [
  { id: 'proj-villa', title: 'The Golden Crest Villa', category: 'Villas', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', description: 'Ultra-luxury villa using Calacatta slabs throughout the open-plan lounge.', location: 'Mumbai, MH', year: 2025 },
  { id: 'proj-apt', title: 'Skyline Penthouse', category: 'Apartments', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', description: 'Minimalist wooden plank layout in primary bedrooms and balconies.', location: 'Gurugram, HR', year: 2024 },
  { id: 'proj-hotel', title: 'Aura Boutique Hotel Lobby', category: 'Hotels', image: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80', description: 'Sleek dark Carrara Grey marble matching luxury architectural accents.', location: 'Goa', year: 2025 },
  { id: 'proj-office', title: 'Nexus Headquarters', category: 'Offices', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', description: 'High-traffic Stone Grigio matte tiles covering 10,000 sq ft.', location: 'Bengaluru, KA', year: 2024 },
  { id: 'proj-restaurant', title: 'L’Avenue Fine Dine', category: 'Restaurants', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80', description: 'Curated mix of Sahara Crema and wooden trims for elegant bistro warmth.', location: 'Delhi', year: 2025 }
];

const seedTestimonials: Testimonial[] = [
  { id: 'test-1', name: 'Rohit Sharma', role: 'Architect & Interior Designer', rating: 5, comment: 'The tile quality is exceptional. It completely transformed our luxury residential project. Calacatta White has incredible glaze depth.', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { id: 'test-2', name: 'Alisha Patil', role: 'Lead Architect, AP Studio', rating: 5, comment: 'Perfect finish, premium quality, and amazing designs. Our high-net-worth clients love it. Prompt delivery and excellent damage-free packaging.', image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { id: 'test-3', name: 'Vikram Malhotra', role: 'Estate Builder, Skyline Group', rating: 5, comment: 'We have been using their tiles in our luxury complexes. Unbeatable strength, excellent water resistance, and consistent batch colors.', image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
];

const seedDealers: Dealer[] = [
  { id: 'deal-1', name: 'Sangli Ceramica Headroom', state: 'Maharashtra', city: 'Sangli', address: '102, Gold Palace Mall, Kolhapur Road, Sangli - 416416', phone: '+91 98765 43210', email: 'sangli@ceramicapremium.com', coords: { lat: 16.8524, lng: 74.5816 } },
  { id: 'deal-2', name: 'Elite Tiles & Marbles', state: 'Maharashtra', city: 'Mumbai', address: '45, Galleria Arcade, Hiranandani Gardens, Powai, Mumbai - 400076', phone: '+91 98765 43211', email: 'powai@ceramicapremium.com', coords: { lat: 19.1176, lng: 72.9060 } },
  { id: 'deal-3', name: 'Deco Stones Hub', state: 'Delhi', city: 'New Delhi', address: 'Shop 12, Ring Road Marble Market, Rajouri Garden, New Delhi - 110027', phone: '+91 98765 43212', email: 'delhi@ceramicapremium.com', coords: { lat: 28.6415, lng: 77.1209 } },
  { id: 'deal-4', name: 'Golden Granites & Ceramics', state: 'Karnataka', city: 'Bengaluru', address: '88, 100 Feet Road, Indiranagar, Bengaluru - 560038', phone: '+91 98765 43213', email: 'bangalore@ceramicapremium.com', coords: { lat: 12.9784, lng: 77.6408 } },
  { id: 'deal-5', name: 'Maruti Tile Studio', state: 'Gujarat', city: 'Ahmedabad', address: 'G-4, Capital Plaza, SG Highway, Ahmedabad - 380054', phone: '+91 98765 43214', email: 'ahmedabad@ceramicapremium.com', coords: { lat: 23.0225, lng: 72.5714 } },
  { id: 'deal-6', name: 'Prestige Ceramics', state: 'Tamil Nadu', city: 'Chennai', address: '22, Mount Road, Nandanam, Chennai - 600035', phone: '+91 98765 43215', email: 'chennai@ceramicapremium.com', coords: { lat: 13.0305, lng: 80.2354 } }
];

const seedCatalogues: Catalogue[] = [
  { id: 'cat-1', title: 'Grandeur Slab Collection 2026', pdf_url: '#', thumbnail_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', file_size: '18.4 MB' },
  { id: 'cat-2', title: 'Vitrified Planks & Wood Catalogue', pdf_url: '#', thumbnail_url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80', file_size: '12.1 MB' }
];

// Helper to interact with LocalStorage for mock database simulation
const getLocalStorageData = <T>(key: string, seed: T): T => {
  if (typeof window === 'undefined') return seed;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(item);
  } catch (e) {
    return seed;
  }
};

const setLocalStorageData = <T>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Database APIs
export const dbService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data) return data;
    }
    return getLocalStorageData('sangli_categories', seedCategories);
  },

  // Collections
  async getCollections(): Promise<Collection[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('collections').select('*');
      if (!error && data) return data;
    }
    return getLocalStorageData('sangli_collections', seedCollections);
  },

  // Products
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) return data;
    }
    return getLocalStorageData('sangli_products', seedProducts);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find(p => p.id === id || p.slug === id);
  },

  async saveProduct(product: Product): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').upsert(product).select().single();
      if (!error && data) return data;
    }
    const products = await this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      products.push(product);
    }
    setLocalStorageData('sangli_products', products);
    return product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
    }
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    setLocalStorageData('sangli_products', filtered);
    return true;
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').select('*');
      if (!error && data) return data;
    }
    return getLocalStorageData('sangli_projects', seedProjects);
  },

  async saveProject(project: Project): Promise<Project> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').upsert(project).select().single();
      if (!error && data) return data;
    }
    const projects = await this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      projects[idx] = project;
    } else {
      projects.push(project);
    }
    setLocalStorageData('sangli_projects', projects);
    return project;
  },

  async deleteProject(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) return true;
    }
    const projects = await this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    setLocalStorageData('sangli_projects', filtered);
    return true;
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('testimonials').select('*');
      if (!error && data) return data;
    }
    return getLocalStorageData('sangli_testimonials', seedTestimonials);
  },

  // Dealers
  async getDealers(): Promise<Dealer[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('dealers').select('*');
      if (!error && data) return data;
    }
    return getLocalStorageData('sangli_dealers', seedDealers);
  },

  async saveDealer(dealer: Dealer): Promise<Dealer> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('dealers').upsert(dealer).select().single();
      if (!error && data) return data;
    }
    const dealers = await this.getDealers();
    const idx = dealers.findIndex(d => d.id === dealer.id);
    if (idx >= 0) {
      dealers[idx] = dealer;
    } else {
      dealers.push(dealer);
    }
    setLocalStorageData('sangli_dealers', dealers);
    return dealer;
  },

  async deleteDealer(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('dealers').delete().eq('id', id);
      if (!error) return true;
    }
    const dealers = await this.getDealers();
    const filtered = dealers.filter(d => d.id !== id);
    setLocalStorageData('sangli_dealers', filtered);
    return true;
  },

  // Catalogues
  async getCatalogues(): Promise<Catalogue[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('catalogues').select('*');
      if (!error && data) return data;
    }
    return getLocalStorageData('sangli_catalogues', seedCatalogues);
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocalStorageData('sangli_leads', []);
  },

  async insertLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> {
    const newLead: Lead = {
      ...lead,
      id: Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leads').insert(newLead).select().single();
      if (!error && data) return data;
    }
    const leads = await this.getLeads();
    leads.unshift(newLead);
    setLocalStorageData('sangli_leads', leads);
    return newLead;
  },

  async updateLeadStatus(id: string, status: 'new' | 'contacted' | 'closed'): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);
      if (!error) return true;
    }
    const leads = await this.getLeads();
    const idx = leads.findIndex(l => l.id === id);
    if (idx >= 0) {
      leads[idx].status = status;
      return true;
    }
    return false;
  },

  // Admin Credentials
  async verifyAdminPasscode(passcode: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('settings').select('value').eq('key', 'admin_passcode').single();
      if (!error && data) {
        return data.value === passcode;
      }
      // If no passcode is set in DB yet, fallback to default 'admin123' and check
      if (error && error.code === 'PGRST116') {
        return passcode === 'admin123' || passcode === 'admin';
      }
    }
    const stored = getLocalStorageData('sangli_admin_passcode', 'admin123');
    return passcode === stored || (stored === 'admin123' && passcode === 'admin');
  },

  async updateAdminPasscode(newPasscode: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('settings').upsert({ key: 'admin_passcode', value: newPasscode });
      if (!error) return true;
    }
    setLocalStorageData('sangli_admin_passcode', newPasscode);
    return true;
  }
};
