import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import ThumbnailGeneratorPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('thumbnail-generator');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function ThumbnailGeneratorPage() {
  return <ThumbnailGeneratorPageClient />;
}
