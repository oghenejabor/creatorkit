import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import TiktokVoiceoverGeneratorPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('tiktok-voiceover-generator');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function TiktokVoiceoverGeneratorPage() {
  return <TiktokVoiceoverGeneratorPageClient />;
}
