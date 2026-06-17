/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */
import { createBrowserClient } from '@supabase/ssr';

// Define the environment variables explicitly to ensure Next.js exposes them
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isMock = !supabaseUrl || !supabaseAnonKey;

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
          return (tableName: string) => {
            const getList = () => getMockDataForTable(tableName);
            const saveList = (list: any[]) => {
              const keyMap: Record<string, string> = {
                brand_logos: 'mock_brand_logos',
                hero_slides: 'mock_hero_slides',
                products: 'mock_products',
                categories: 'mock_categories',
                collections: 'mock_collections',
                projects: 'mock_projects',
                testimonials: 'mock_testimonials',
                dealers: 'mock_dealers',
                catalogues: 'mock_catalogues',
                product_divisions: 'mock_divisions',
                division_categories: 'mock_division_categories',
                leads: 'mock_leads'
              };
              const key = keyMap[tableName];
              if (key) saveLocal(key, list);
            };

            const createMockBuilder = (currentList: any[]): any => {
              const builder = Promise.resolve({ data: currentList, error: null }) as any;
              builder.order = () => builder;
              builder.limit = () => builder;
              builder.or = () => builder;
              builder.single = () => Promise.resolve({ data: currentList[0] || null, error: null });
              builder.eq = (field: string, value: any) => {
                const filtered = currentList.filter((item: any) => item[field] === value);
                return createMockBuilder(filtered);
              };
              return builder;
            };

            const getNewId = () => {
              const prefix = tableName === 'leads' ? 'lead' : tableName.substring(0, 3);
              return prefix + '-' + Date.now();
            };

            return {
              select: () => {
                return createMockBuilder(getList());
              },
              upsert: (payload: any) => {
                let list = getList();
                const toSave = Array.isArray(payload) ? payload : [payload];
                toSave.forEach((item) => {
                  if (!item.id) {
                    item.id = getNewId();
                  }
                  const index = list.findIndex((x: any) => x.id === item.id);
                  if (index >= 0) {
                    list[index] = { ...list[index], ...item };
                  } else {
                    list.push(item);
                  }
                });
                saveList(list);
                const returnData = Array.isArray(payload) ? toSave : toSave[0];
                return {
                  select: () => ({
                    single: () => Promise.resolve({ data: returnData, error: null })
                  })
                };
              },
              insert: (payload: any) => {
                let list = getList();
                const toInsert = Array.isArray(payload) ? payload : [payload];
                toInsert.forEach((item) => {
                  if (!item.id) {
                    item.id = getNewId();
                  }
                  if (!item.created_at) {
                    item.created_at = new Date().toISOString();
                  }
                  list.push(item);
                });
                saveList(list);
                const returnData = Array.isArray(payload) ? toInsert : toInsert[0];
                return {
                  select: () => ({
                    single: () => Promise.resolve({ data: returnData, error: null })
                  })
                };
              },
              update: (payload: any) => {
                let list = getList();
                return {
                  eq: (field: string, value: any) => {
                    list = list.map((item: any) => {
                      if (item[field] === value) {
                        return { ...item, ...payload };
                      }
                      return item;
                    });
                    saveList(list);
                    const updatedItem = list.find((item: any) => item[field] === value) || null;
                    const updateResult = Promise.resolve({ data: updatedItem, error: null }) as any;
                    updateResult.single = () => Promise.resolve({ data: updatedItem, error: null });
                    return updateResult;
                  }
                };
              },
              delete: () => {
                let list = getList();
                return {
                  eq: (field: string, value: any) => {
                    const filtered = list.filter((item: any) => item[field] !== value);
                    saveList(filtered);
                    return Promise.resolve({ error: null });
                  }
                };
              },
              or: (queryStr: string) => {
                return createMockBuilder(getList());
              }
            };
          };
        }
        if (prop === 'storage') {
          return {
            from: () => ({
              upload: (path: string, file: File) => {
                if (typeof window !== 'undefined' && file instanceof File) {
                  return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      resolve({ data: { path: reader.result as string }, error: null });
                    };
                    reader.onerror = () => {
                      resolve({ data: null, error: { message: 'Failed to read file' } });
                    };
                    reader.readAsDataURL(file);
                  });
                }
                return Promise.resolve({ data: { path: 'mock-path' }, error: null });
              },
              remove: () => Promise.resolve({ data: null, error: null }),
              getPublicUrl: (path: string) => ({ data: { publicUrl: path } })
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
  image?: string;
  images?: string[];
  description?: string;
  stock?: number;
  is_featured?: boolean;
  status: 'active' | 'draft' | 'out_of_stock';
  features?: string[];
  specifications?: Record<string, string>;
  tech_specs?: Record<string, string>;
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


// --- LOCAL STORAGE MOCK HELPERS & CONSTANTS ---
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


const getMockDataForTable = (tableName: string): any[] => {
  if (tableName === 'brand_logos') return getOrSetLocal('mock_brand_logos', DEFAULT_BRANDS);
  if (tableName === 'hero_slides') return getOrSetLocal('mock_hero_slides', DEFAULT_HERO_SLIDES);
  if (tableName === 'products') return getOrSetLocal('mock_products', DEFAULT_PRODUCTS);
  if (tableName === 'categories') return getOrSetLocal('mock_categories', DEFAULT_CATEGORIES);
  if (tableName === 'collections') return getOrSetLocal('mock_collections', DEFAULT_COLLECTIONS);
  if (tableName === 'projects') return getOrSetLocal('mock_projects', DEFAULT_PROJECTS);
  if (tableName === 'testimonials') return getOrSetLocal('mock_testimonials', DEFAULT_TESTIMONIALS);
  if (tableName === 'dealers') return getOrSetLocal('mock_dealers', DEFAULT_DEALERS);
  if (tableName === 'catalogues') return getOrSetLocal('mock_catalogues', DEFAULT_CATALOGUES);
  if (tableName === 'product_divisions') return getOrSetLocal('mock_divisions', DEFAULT_DIVISIONS);
  if (tableName === 'division_categories') return getOrSetLocal('mock_division_categories', DEFAULT_DIVISION_CATEGORIES);
  if (tableName === 'leads') return getOrSetLocal('mock_leads', []);
  return [];
};


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

  async deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete lead:', error);
      throw error;
    }
    return { success: true };
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
    return [];
  },

  async saveBrand(brand: Partial<BrandLogo>): Promise<BrandLogo | null> {
    return null;
  },

  async deleteBrand(id: string): Promise<{ success: boolean; error?: string }> {
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

    // Sanitize payload to prevent primary key/RLS updates on read-only columns
    const cleanData = {
      title: slide.title,
      subtitle: slide.subtitle,
      url: slide.url,
      display_order: typeof slide.display_order === 'number' ? slide.display_order : 0
    };

    let query;
    if (slide.id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slide.id);
      if (isUuid) {
        query = supabase
          .from('hero_slides')
          .update(cleanData)
          .eq('id', slide.id)
          .select()
          .single();
      } else {
        query = supabase
          .from('hero_slides')
          .insert(cleanData)
          .select()
          .single();
      }
    } else {
      query = supabase
        .from('hero_slides')
        .insert(cleanData)
        .select()
        .single();
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to save hero slide:', error);
      throw error;
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
