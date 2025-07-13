import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import ScriptRewriterPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('script-rewriter');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function ScriptRewriterPage() {
  return <ScriptRewriterPageClient />;
}
