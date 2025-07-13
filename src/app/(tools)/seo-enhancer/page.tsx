import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import SeoEnhancerPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('seo-enhancer');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function SeoEnhancerPage() {
  return <SeoEnhancerPageClient />;
}
