import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import TiktokScriptGeneratorPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('tiktok-script-generator');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function TiktokScriptGeneratorPage() {
  return <TiktokScriptGeneratorPageClient />;
}
