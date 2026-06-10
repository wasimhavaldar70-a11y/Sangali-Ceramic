import { dbService } from '@/lib/supabase';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';
import { Compass } from 'lucide-react';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  // Fetch product data on the server
  const product = await dbService.getProductById(slug);
  
  if (!product) {
    notFound();
  }

  // Fetch related products based on category or collection
  const allProds = await dbService.getProducts();
  const relatedProducts = allProds
    .filter(p => p.id !== product.id && (p.category_id === product.category_id || p.collection_id === product.collection_id))
    .slice(0, 3);

  return <ProductClient initialProduct={product} relatedProducts={relatedProducts} />;
}
