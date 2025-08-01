import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import TiktokDownloaderPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('tiktok-downloader');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function TiktokDownloaderPage() {
  return <TiktokDownloaderPageClient />;
}