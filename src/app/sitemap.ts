import { MetadataRoute } from 'next';
import { defaultSeoData } from '@/lib/seo-defaults';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://creatorkit.ai';

  const toolPages = Object.keys(defaultSeoData)
    .map((key) => {
      // Exclude legal pages from this list as they will be added separately
      if (['privacy-policy', 'cookie-policy', 'terms-and-conditions'].includes(key)) {
        return null;
      }
      return {
        url: `${siteUrl}/${key}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      } as const;
    }).filter(Boolean);

    const legalPages = [
        {
            url: `${siteUrl}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${siteUrl}/cookie-policy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${siteUrl}/terms-and-conditions`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    ...toolPages,
    ...legalPages,
  ];
}
