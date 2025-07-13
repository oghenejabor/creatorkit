import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import TiktokBioGeneratorPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('tiktok-bio-generator');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function TiktokBioGeneratorPage() {
  return <TiktokBioGeneratorPageClient />;
}
