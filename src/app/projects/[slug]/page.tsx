import { notFound } from 'next/navigation';
import { dbService } from '@/lib/db';
import ProjectClient from './ProjectClient';
import { Metadata } from 'next';

export const revalidate = 60; // ISR cache

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await dbService.getProjectBySlug(slug);
  
  if (!project) {
    return { title: 'Project Not Found | Sangli Ceramica' };
  }

  return {
    title: `${project.title} | Sangli Ceramica Projects`,
    description: project.description || `View details for the ${project.title} project by Sangli Ceramica.`,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.image],
    }
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch specific project
  const project = await dbService.getProjectBySlug(slug);
  
  if (!project) {
    notFound();
  }

  // Fetch all products (for mapping product_ids)
  const allProducts = await dbService.getProducts();
  const usedProducts = allProducts.filter(p => project.product_ids?.includes(p.id));

  return <ProjectClient project={project} usedProducts={usedProducts} />;
}
