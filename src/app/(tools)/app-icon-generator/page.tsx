import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import AppIconGeneratorPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('app-icon-generator');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function AppIconGeneratorPage() {
  return <AppIconGeneratorPageClient />;
}
