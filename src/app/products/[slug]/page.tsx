import { dbService } from '@/lib/db';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const product = await dbService.getProductById(slug);
  
  if (!product) return {};

  return {
    title: `${product.name} | Sangli Ceramica`,
    description: product.meta_description || product.description || `Buy ${product.name} premium luxury tiles from Sangli Ceramica.`,
    openGraph: {
      title: product.name,
      description: product.meta_description || product.description || `Premium luxury ${product.finish} tiles.`,
      images: [product.images[0]],
      url: `https://sangliceramica.com/products/${product.slug}`
    }
  };
}

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Sangli Ceramica'
    },
    offers: {
      '@type': 'Offer',
      url: `https://sangliceramica.com/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient initialProduct={product} relatedProducts={relatedProducts} />
    </>
  );
}
