import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import ImageOverlayPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('image-overlay');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function ImageOverlayPage() {
  return <ImageOverlayPageClient />;
}
