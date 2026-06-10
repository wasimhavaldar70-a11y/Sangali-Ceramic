import { MetadataRoute } from 'next';
import { dbService } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await dbService.getProducts();
  
  const productEntries = products.map((prod) => ({
    url: `https://ceramicapremiumtiles.vercel.app/products/${prod.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://ceramicapremiumtiles.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://ceramicapremiumtiles.vercel.app/visualizer',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://ceramicapremiumtiles.vercel.app/dealer-network',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...productEntries,
  ];
}
