
import { getSeoData } from '@/lib/seo-service';
import { getLegalContent } from '@/lib/legal-service';
import type { Metadata } from 'next';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import React from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('cookie-policy');
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
  };
}

export default async function CookiePolicyPage() {
  const content = await getLegalContent('cookie-policy');

  const paragraphs = content.split('\n\n').filter(p => p.trim() !== '');
  const adPositions = [
    Math.floor(paragraphs.length / 3),
    Math.floor((paragraphs.length * 2) / 3),
  ].filter((pos, index, self) => pos > 0 && self.indexOf(pos) === index);

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-headline text-4xl font-bold mb-6">Cookie Policy</h1>
        <div className="mb-8">
          <AdPlaceholder adKey="global-ad-script" />
        </div>
        <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary dark:prose-invert">
          {paragraphs.map((p, index) => (
            <React.Fragment key={index}>
              <div dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br />').replace(/<a/g, '<a target="_blank" rel="noopener noreferrer"') }} />
              {adPositions.includes(index) && (
                <div className="my-8 not-prose">
                  <AdPlaceholder adKey="global-ad-script" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </main>
  );
}
