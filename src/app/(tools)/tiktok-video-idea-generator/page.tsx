import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import TiktokVideoIdeaGeneratorPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('tiktok-video-idea-generator');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function TiktokVideoIdeaGeneratorPage() {
  return <TiktokVideoIdeaGeneratorPageClient />;
}
