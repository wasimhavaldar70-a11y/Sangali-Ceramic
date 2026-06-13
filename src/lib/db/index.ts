import { createClient } from '@/lib/db/client';

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

// --- SEEDS FOR MOCK FALLBACK ---

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-tiles', name: 'Premium Tiles', slug: 'tiles', description: 'Curated vitrified slabs and ceramic collections.' },
  { id: 'cat-bath', name: 'Luxury Bathroom Products', slug: 'bath-fittings', description: 'Authorized premium sanitaryware & bath fittings.' },
  { id: 'cat-doors', name: 'Tata Pravesh Doors', slug: 'doors', description: 'Elegant and durable steel doors and windows.' }
];

const DEFAULT_COLLECTIONS: Collection[] = [
  { id: 'col-marble', name: 'Marble Collection', slug: 'marble-collection', description: 'Mirror-polished luxury marble vitrified slabs.' },
  { id: 'col-wooden', name: 'Wooden Collection', slug: 'wooden-collection', description: 'Tactile woodgrain plank tiles.' },
  { id: 'col-stone', name: 'Stone Collection', slug: 'stone-collection', description: 'Rustic structured slate & stone textures.' },
  { id: 'col-glossy', name: 'Glossy Collection', slug: 'glossy-collection', description: 'High-reflectivity polished surfaces.' },
  { id: 'col-matte', name: 'Matte Collection', slug: 'matte-collection', description: 'Minimalist contemporary matte finishes.' },
  { id: 'col-large', name: 'Large Format Slabs', slug: 'large-format-slabs', description: 'Grand vitrified architectural slabs.' }
];

const DEFAULT_PROJECTS: Project[] = [
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

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: 'test-1', name: 'Rohit Sharma', role: 'Homeowner', rating: 5, comment: 'The quality of vitrified slabs is exceptional. It completely transformed our living lounge.' },
  { id: 'test-2', name: 'Ar. Neha Patil', role: 'Architect', rating: 5, comment: 'Perfect finish, exact dimensional consistency, and excellent premium customer support. Highly recommended!' },
  { id: 'test-3', name: 'Luxe Spaces Studio', role: 'Interior Designer', rating: 5, comment: 'Their Jaquar bathroom display collections and Tata doors supply let us complete luxury villas in records time.' },
  { id: 'test-4', name: 'Buildtech Developers', role: 'Commercial Builder', rating: 5, comment: 'Sangli Ceramica is our absolute partner for bulk vitrified tile shipments across Maharashtra.' }
];

const DEFAULT_DEALERS: Dealer[] = [
  { id: 'deal-1', name: 'Sangli Ceramica Gallery Pune', state: 'Maharashtra', city: 'Pune', address: 'Ishanya Mall, Yerawada', phone: '+91 92846 32524', email: 'pune@sangliceramica.com', coords: { lat: 18.552, lng: 73.882 } },
  { id: 'deal-2', name: 'Luxe Tiles Mansion', state: 'Maharashtra', city: 'Mumbai', address: 'S.V. Road, Santacruz West', phone: '+91 92846 32524', email: 'mumbai@sangliceramica.com', coords: { lat: 19.082, lng: 72.839 } },
  { id: 'deal-3', name: 'Architectural Surfaces', state: 'Karnataka', city: 'Bangalore', address: 'Indiranagar 100ft Road', phone: '+91 92846 32524', email: 'blr@sangliceramica.com', coords: { lat: 12.971, lng: 77.594 } },
  { id: 'deal-4', name: 'Royal Stone & Tile', state: 'Delhi', city: 'Delhi', address: 'Kirti Nagar Industrial Area', phone: '+91 92846 32524', email: 'delhi@sangliceramica.com', coords: { lat: 28.613, lng: 77.209 } },
  { id: 'deal-5', name: 'Elite Tiles & Sanitary', state: 'Tamil Nadu', city: 'Chennai', address: 'Nungambakkam High Road', phone: '+91 92846 32524', email: 'chennai@sangliceramica.com', coords: { lat: 13.082, lng: 80.270 } },
  { id: 'deal-6', name: 'Vitrified Hub Ahmedabad', state: 'Gujarat', city: 'Ahmedabad', address: 'S.G. Highway', phone: '+91 92846 32524', email: 'ahmedabad@sangliceramica.com', coords: { lat: 23.022, lng: 72.571 } }
];

const DEFAULT_CATALOGUES: Catalogue[] = [
  { id: 'cat-1', title: 'Grandeur Vitrified Floor Collection', pdf_url: '#', thumbnail_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80', file_size: '12.4 MB' },
  { id: 'cat-2', title: 'Luxury Bathroom & Wall Concepts', pdf_url: '#', thumbnail_url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=80', file_size: '8.2 MB' },
  { id: 'cat-3', title: 'Earthy Wood & Stone Plank Series', pdf_url: '#', thumbnail_url: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=400&q=80', file_size: '15.1 MB' },
  { id: 'cat-4', title: 'Heavy-Duty Exterior & Balcony Tiles', pdf_url: '#', thumbnail_url: 'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?auto=format&fit=crop&w=400&q=80', file_size: '6.7 MB' }
];

const DEFAULT_DIVISIONS: ProductDivision[] = [
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

const DEFAULT_DIVISION_CATEGORIES: DivisionCategory[] = [
  // Tiles categories
  { id: 'dc-living', page_slug: 'tiles', name: 'Living Room', image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', display_order: 1 },
  { id: 'dc-bath', page_slug: 'tiles', name: 'Bathroom', image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80', display_order: 2 },
  { id: 'dc-kitchen', page_slug: 'tiles', name: 'Kitchen', image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80', display_order: 3 },
  { id: 'dc-outdoor', page_slug: 'tiles', name: 'Outdoor', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', display_order: 4 },
  { id: 'dc-commercial', page_slug: 'tiles', name: 'Commercial', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80', display_order: 5 },
  { id: 'dc-parking', page_slug: 'tiles', name: 'Parking', image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80', display_order: 6 },
  // Bath fittings categories
  { id: 'dc-faucets', page_slug: 'bath-fittings', name: 'Faucets & Taps', image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80', display_order: 1 },
  { id: 'dc-sanitary', page_slug: 'bath-fittings', name: 'Sanitaryware', image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80', display_order: 2 },
  { id: 'dc-tubs', page_slug: 'bath-fittings', name: 'Wellness & Tubs', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', display_order: 3 },
  { id: 'dc-showers', page_slug: 'bath-fittings', name: 'Shower Systems', image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', display_order: 4 },
  { id: 'dc-heaters', page_slug: 'bath-fittings', name: 'Water Heaters', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80', display_order: 5 },
  { id: 'dc-accessories', page_slug: 'bath-fittings', name: 'Bath Accessories', image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80', display_order: 6 },
  // Doors categories
  { id: 'dc-maindoors', page_slug: 'doors', name: 'Main Entry Doors', image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80', display_order: 1 },
  { id: 'dc-beddoors', page_slug: 'doors', name: 'Bedroom Doors', image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=400&q=80', display_order: 2 },
  { id: 'dc-bathdoors', page_slug: 'doors', name: 'Toilet & Bath Doors', image_url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80', display_order: 3 },
  { id: 'dc-steeldoors', page_slug: 'doors', name: 'Safety Steel Doors', image_url: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=400&q=80', display_order: 4 },
  { id: 'dc-windows', page_slug: 'doors', name: 'Steel Windows', image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80', display_order: 5 },
  { id: 'dc-doubledoors', page_slug: 'doors', name: 'Double Leaf Doors', image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=400&q=80', display_order: 6 }
];

const DEFAULT_BRANDS: BrandLogo[] = [
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

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
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

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-calacatta',
    name: 'Calacatta White',
    slug: 'calacatta-white',
    sku: 'SLAB-CAL-WHT',
    size: '800x1600 mm',
    finish: 'Glossy',
    price: 1299,
    category_id: 'cat-tiles',
    collection_id: 'col-marble',
    division_category_id: 'dc-living',
    images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'],
    description: 'Classic Italian marble design with gold and grey veins.',
    status: 'active',
    is_featured: true,
    tech_specs: { water_absorption: '< 0.05%', hardness: '6 Mohs', thickness: '9 mm' }
  },
  {
    id: 'prod-royalbeige',
    name: 'Royal Beige Matte',
    slug: 'royal-beige-matte',
    sku: 'SLAB-ROY-BGE',
    size: '800x1600 mm',
    finish: 'Matte',
    price: 1150,
    category_id: 'cat-tiles',
    collection_id: 'col-matte',
    division_category_id: 'dc-living',
    images: ['https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=800&q=80'],
    description: 'Understated beige texture for minimalist spaces.',
    status: 'active',
    is_featured: true,
    tech_specs: { water_absorption: '< 0.05%', hardness: '6.5 Mohs', thickness: '9 mm' }
  },
  {
    id: 'prod-carraragrey',
    name: 'Carrara Grey Polished',
    slug: 'carrara-grey-polished',
    sku: 'SLAB-CAR-GRY',
    size: '600x1200 mm',
    finish: 'Glossy',
    price: 980,
    category_id: 'cat-tiles',
    collection_id: 'col-glossy',
    division_category_id: 'dc-bathroom',
    images: ['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'],
    description: 'Graceful grey marble veins on polished surface.',
    status: 'active',
    is_featured: true,
    tech_specs: { water_absorption: '< 0.08%', hardness: '5.5 Mohs', thickness: '8.5 mm' }
  },
  {
    id: 'prod-woodenbrown',
    name: 'Wooden Brown Plank',
    slug: 'wooden-brown-plank',
    sku: 'TILE-WD-BRN',
    size: '200x1200 mm',
    finish: 'Satin',
    price: 850,
    category_id: 'cat-tiles',
    collection_id: 'col-wooden',
    division_category_id: 'dc-outdoor',
    images: ['https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80'],
    description: 'Realistic wooden grain texture with tactile finish.',
    status: 'active',
    is_featured: true,
    tech_specs: { water_absorption: '< 0.1%', hardness: '7 Mohs', thickness: '10 mm' }
  },
  {
    id: 'prod-jaq-alive',
    name: 'Jaquar Alive Basin Mixer',
    slug: 'jaquar-alive-basin-mixer',
    sku: 'JAQ-ALV-BM01',
    size: 'Standard',
    finish: 'Chrome',
    price: 5490,
    category_id: 'cat-bath',
    division_category_id: 'dc-faucets',
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
    description: 'Jaquar Alive single lever basin mixer with premium chrome plating.',
    status: 'active',
    is_featured: true,
    tech_specs: { thickness: 'N/A' }
  },
  {
    id: 'prod-tata-single',
    name: 'Tata Pravesh Single Leaf Entry Door',
    slug: 'tata-pravesh-single-leaf-entry-door',
    sku: 'TATA-PRV-SLD01',
    size: '3.5 x 7 ft',
    finish: 'Woodgrain Embossed',
    price: 18500,
    category_id: 'cat-doors',
    division_category_id: 'dc-maindoors',
    images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'],
    description: 'Premium safety steel door combining wood aesthetics and high-grade security.',
    status: 'active',
    is_featured: true
  }
];

// --- DATABASE SERVICE SINGLETON ---

const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Local storage init helper
const getOrSetLocal = <T>(key: string, defaults: T[]): T[] => {
  if (typeof window === 'undefined') {
    return defaults;
  }
  const data = window.localStorage.getItem(key);
  if (!data) {
    window.localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaults;
  }
};

const saveLocal = <T>(key: string, data: T[]): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(data));
  }
};

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
    if (isMock) {
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
    if (isMock) {
      return getOrSetLocal('mock_categories', DEFAULT_CATEGORIES);
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('categories').select('*');
    if (error) console.error(error);
    return data || [];
  },

  // Collections
  async getCollections(): Promise<Collection[]> {
    if (isMock) {
      return getOrSetLocal('mock_collections', DEFAULT_COLLECTIONS);
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('collections').select('*');
    if (error) console.error(error);
    return data || [];
  },

  // Products
  async getProducts(searchQuery?: string, divisionCategoryId?: string): Promise<Product[]> {
    if (isMock) {
      let list = getOrSetLocal('mock_products', DEFAULT_PRODUCTS);
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query));
      }
      if (divisionCategoryId) {
        list = list.filter(p => p.division_category_id === divisionCategoryId);
      }
      return list;
    }

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
    if (isMock) {
      const list = getOrSetLocal('mock_products', DEFAULT_PRODUCTS);
      return list.find(p => p.id === id || p.slug === id);
    }

    const supabase = createClient();
    const { data, error } = await supabase.from('products')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();
    if (error) console.error(error);
    return data || undefined;
  },

  async saveProduct(product: Partial<Product>): Promise<Product | null> {
    if (isMock) {
      const list = getOrSetLocal('mock_products', DEFAULT_PRODUCTS);
      const toSave = { ...product } as Product;
      if (!toSave.id || toSave.id.startsWith('prod-')) {
        toSave.id = 'prod-' + Date.now();
      }
      if (!toSave.slug) {
        toSave.slug = toSave.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      const index = list.findIndex(p => p.id === toSave.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...toSave };
      } else {
        list.push(toSave);
      }
      saveLocal('mock_products', list);
      return toSave;
    }

    const supabase = createClient();
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
    if (isMock) {
      const list = getOrSetLocal('mock_products', DEFAULT_PRODUCTS);
      const filtered = list.filter(p => p.id !== id);
      saveLocal('mock_products', filtered);
      return true;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return true;

    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    if (isMock) {
      return getOrSetLocal('mock_projects', DEFAULT_PROJECTS);
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('projects').select('*');
    if (!error && data && data.length > 0) {
      return data;
    }
    
    // Seed default projects if DB table is empty
    if (!error && data && data.length === 0) {
      try {
        const seedData = DEFAULT_PROJECTS.map(({ id, ...rest }) => rest);
        const { data: seeded, error: seedError } = await supabase.from('projects').insert(seedData).select();
        if (!seedError && seeded && seeded.length > 0) {
          return seeded;
        }
      } catch (seedErr) {
        console.error('Failed to seed default projects:', seedErr);
      }
    }
    return DEFAULT_PROJECTS;
  },

  async saveProject(project: Partial<Project>): Promise<Project | null> {
    if (isMock) {
      const list = getOrSetLocal('mock_projects', DEFAULT_PROJECTS);
      const toSave = { ...project } as Project;
      if (!toSave.id || toSave.id.startsWith('proj-')) {
        toSave.id = 'proj-' + Date.now();
      }
      if (!toSave.slug) {
        toSave.slug = toSave.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      const index = list.findIndex(p => p.id === toSave.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...toSave };
      } else {
        list.push(toSave);
      }
      saveLocal('mock_projects', list);
      return toSave;
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
    if (isMock) {
      const list = getOrSetLocal('mock_projects', DEFAULT_PROJECTS);
      const filtered = list.filter(p => p.id !== id);
      saveLocal('mock_projects', filtered);
      return true;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return true;

    const supabase = createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    if (isMock) {
      return getOrSetLocal('mock_testimonials', DEFAULT_TESTIMONIALS);
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('testimonials').select('*');
    if (error) console.error(error);
    return data || [];
  },

  // Dealers
  async getDealers(): Promise<Dealer[]> {
    if (isMock) {
      return getOrSetLocal('mock_dealers', DEFAULT_DEALERS);
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('dealers').select('*');
    if (error) console.error(error);
    return data || [];
  },

  async saveDealer(dealer: Partial<Dealer>): Promise<Dealer | null> {
    if (isMock) {
      const list = getOrSetLocal('mock_dealers', DEFAULT_DEALERS);
      const toSave = { ...dealer } as Dealer;
      if (!toSave.id || toSave.id.startsWith('deal-')) {
        toSave.id = 'deal-' + Date.now();
      }
      const index = list.findIndex(d => d.id === toSave.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...toSave };
      } else {
        list.push(toSave);
      }
      saveLocal('mock_dealers', list);
      return toSave;
    }

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
    if (isMock) {
      const list = getOrSetLocal('mock_dealers', DEFAULT_DEALERS);
      const filtered = list.filter(d => d.id !== id);
      saveLocal('mock_dealers', filtered);
      return true;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return true;

    const supabase = createClient();
    const { error } = await supabase.from('dealers').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Catalogues
  async getCatalogues(): Promise<Catalogue[]> {
    if (isMock) {
      return getOrSetLocal('mock_catalogues', DEFAULT_CATALOGUES);
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('catalogues').select('*');
    if (error) console.error(error);
    return data || [];
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    if (isMock) {
      return getOrSetLocal<Lead>('mock_leads', []);
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    return data || [];
  },

  async insertLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead | null> {
    if (isMock) {
      const list = getOrSetLocal<Lead>('mock_leads', []);
      const newLead: Lead = {
        ...lead,
        id: 'lead-' + Date.now(),
        created_at: new Date().toISOString()
      };
      list.unshift(newLead);
      saveLocal('mock_leads', list);
      return newLead;
    }

    const supabase = createClient();
    const { data, error } = await supabase.from('leads').insert(lead).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async updateLeadStatus(id: string, status: Lead['status'], notes?: string): Promise<boolean> {
    if (isMock) {
      const list = getOrSetLocal<Lead>('mock_leads', []);
      const index = list.findIndex(l => l.id === id);
      if (index >= 0) {
        list[index].status = status;
        if (notes !== undefined) list[index].notes = notes;
        saveLocal('mock_leads', list);
        return true;
      }
      return false;
    }

    const supabase = createClient();
    const updatePayload: Record<string, unknown> = { status };
    if (notes !== undefined) updatePayload.notes = notes;
    
    const { error } = await supabase.from('leads').update(updatePayload).eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Product Divisions
  async getDivisions(): Promise<ProductDivision[]> {
    if (isMock) {
      return getOrSetLocal('mock_product_divisions', DEFAULT_DIVISIONS);
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('product_divisions').select('*').order('display_order', { ascending: true });
    if (!error && data && data.length > 0) {
      return data;
    }
    return DEFAULT_DIVISIONS;
  },

  async saveDivision(division: Partial<ProductDivision>): Promise<ProductDivision | null> {
    if (isMock) {
      const list = getOrSetLocal('mock_product_divisions', DEFAULT_DIVISIONS);
      const toSave = { ...division } as ProductDivision;
      if (!toSave.id || toSave.id.startsWith('div-')) {
        toSave.id = 'div-' + Date.now();
      }
      const index = list.findIndex(d => d.id === toSave.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...toSave };
      } else {
        list.push(toSave);
      }
      saveLocal('mock_product_divisions', list);
      return toSave;
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
    if (isMock) {
      const list = getOrSetLocal('mock_product_divisions', DEFAULT_DIVISIONS);
      const filtered = list.filter(d => d.id !== id);
      saveLocal('mock_product_divisions', filtered);
      return true;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return true;

    const supabase = createClient();
    const { error } = await supabase.from('product_divisions').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Division Categories
  async getDivisionCategories(pageSlug?: string): Promise<DivisionCategory[]> {
    if (isMock) {
      const list = getOrSetLocal('mock_division_categories', DEFAULT_DIVISION_CATEGORIES);
      if (pageSlug) {
        return list.filter(dc => dc.page_slug === pageSlug);
      }
      return list;
    }

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
    if (isMock) {
      const list = getOrSetLocal('mock_division_categories', DEFAULT_DIVISION_CATEGORIES);
      return list.find(dc => dc.id === id);
    }

    const supabase = createClient();
    const { data, error } = await supabase.from('division_categories').select('*').eq('id', id).single();
    if (error) console.error(error);
    return data || undefined;
  },

  async saveDivisionCategory(category: Partial<DivisionCategory>): Promise<DivisionCategory | null> {
    if (isMock) {
      const list = getOrSetLocal('mock_division_categories', DEFAULT_DIVISION_CATEGORIES);
      const toSave = { ...category } as DivisionCategory;
      if (!toSave.id || toSave.id.startsWith('dc-') || toSave.id.startsWith('cat-')) {
        toSave.id = 'dc-' + Date.now();
      }
      const index = list.findIndex(dc => dc.id === toSave.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...toSave };
      } else {
        list.push(toSave);
      }
      saveLocal('mock_division_categories', list);
      return toSave;
    }

    const supabase = createClient();
    if (category.id && (category.id.startsWith('dc-') || category.id.startsWith('cat-'))) delete category.id;
    const { data, error } = await supabase.from('division_categories').upsert(category).select().single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  async deleteDivisionCategory(id: string): Promise<boolean> {
    if (isMock) {
      const list = getOrSetLocal('mock_division_categories', DEFAULT_DIVISION_CATEGORIES);
      const filtered = list.filter(dc => dc.id !== id);
      saveLocal('mock_division_categories', filtered);
      return true;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return true;

    const supabase = createClient();
    const { error } = await supabase.from('division_categories').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Brand Logos
  async getBrands(): Promise<BrandLogo[]> {
    if (isMock) {
      return getOrSetLocal('mock_brand_logos', DEFAULT_BRANDS);
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('brand_logos').select('*').order('display_order', { ascending: true });
    if (error) console.error(error);
    if (data && data.length > 0) {
      return data;
    }
    return DEFAULT_BRANDS;
  },

  async saveBrand(brand: Partial<BrandLogo>): Promise<BrandLogo | null> {
    if (isMock) {
      const list = getOrSetLocal('mock_brand_logos', DEFAULT_BRANDS);
      const toSave = { ...brand } as BrandLogo;
      if (!toSave.id || toSave.id.startsWith('b-')) {
        toSave.id = 'b-' + Date.now();
      }
      const index = list.findIndex(b => b.id === toSave.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...toSave };
      } else {
        list.push(toSave);
      }
      saveLocal('mock_brand_logos', list);
      return toSave;
    }

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
    if (isMock) {
      const list = getOrSetLocal('mock_brand_logos', DEFAULT_BRANDS);
      const filtered = list.filter(b => b.id !== id);
      saveLocal('mock_brand_logos', filtered);
      return true;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return true;

    const supabase = createClient();
    const { error } = await supabase.from('brand_logos').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  },

  // Hero Slides
  async getHeroSlides(): Promise<HeroSlide[]> {
    if (isMock) {
      return getOrSetLocal('mock_hero_slides', DEFAULT_HERO_SLIDES);
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('hero_slides').select('*').order('display_order', { ascending: true });
    if (!error && data && data.length > 0) {
      return data;
    }
    return DEFAULT_HERO_SLIDES;
  },

  async saveHeroSlide(slide: Partial<HeroSlide>): Promise<HeroSlide | null> {
    if (isMock) {
      const list = getOrSetLocal('mock_hero_slides', DEFAULT_HERO_SLIDES);
      const toSave = { ...slide } as HeroSlide;
      if (!toSave.id || toSave.id.startsWith('slide-')) {
        toSave.id = 'slide-' + Date.now();
      }
      const index = list.findIndex(s => s.id === toSave.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...toSave };
      } else {
        list.push(toSave);
      }
      saveLocal('mock_hero_slides', list);
      return toSave;
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
    if (isMock) {
      const list = getOrSetLocal('mock_hero_slides', DEFAULT_HERO_SLIDES);
      const filtered = list.filter(s => s.id !== id);
      saveLocal('mock_hero_slides', filtered);
      return true;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return true;

    const supabase = createClient();
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  }
};
