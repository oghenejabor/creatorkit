import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import TiktokHashtagGeneratorPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('tiktok-hashtag-generator');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function TiktokHashtagGeneratorPage() {
  return <TiktokHashtagGeneratorPageClient />;
}
