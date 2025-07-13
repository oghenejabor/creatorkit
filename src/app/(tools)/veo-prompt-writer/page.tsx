import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import VeoPromptWriterPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('veo-prompt-writer');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function VeoPromptWriterPage() {
  return <VeoPromptWriterPageClient />;
}
