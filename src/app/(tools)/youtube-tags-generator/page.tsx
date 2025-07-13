import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import YoutubeTagsGeneratorPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('youtube-tags-generator');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function YoutubeTagsGeneratorPage() {
  return <YoutubeTagsGeneratorPageClient />;
}
