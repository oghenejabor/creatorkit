import type { Metadata } from 'next';
import { getSeoData } from '@/lib/seo-service';
import AppPrivacyPolicyGeneratorPageClient from './page-client';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('app-privacy-policy-generator');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default function AppPrivacyPolicyGeneratorPage() {
  return <AppPrivacyPolicyGeneratorPageClient />;
}
