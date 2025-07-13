import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import AppMetadataTranslatorPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('app-metadata-translator');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function AppMetadataTranslatorPage() {
  return <AppMetadataTranslatorPageClient />;
}
