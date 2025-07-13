
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { getVerificationTags } from '@/lib/verification-tag-service';
import { Suspense } from 'react';
import Script from 'next/script';
import { CookieConsentBanner } from '@/components/common/cookie-consent-banner';
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});


export const metadata: Metadata = {
  metadataBase: new URL('https://creatorkit.ai'),
  title: 'CreatorKit AI',
  description: 'An all-in-one AI toolkit for content creators. Generate thumbnails, enhance SEO, rewrite scripts, and optimize ASO.',
  // Explicitly disable favicon generation to prevent Next.js from throwing an error
  // when it can't find a favicon.ico file.
  icons: null,
};

// Component to safely parse and render the script tag from a string
const RawHtmlScript = ({ html }: { html: string }) => {
  if (!html || typeof html !== 'string') return null;

  const match = /<script(.*?)>([\s\S]*?)<\/script>/.exec(html);
  if (!match) return null;

  const a_props: Record<string, string | number | boolean> = {};
  const attrs_str = match[1] || '';
  const inner_html = match[2] || '';

  const attr_matches = [...attrs_str.matchAll(/(\w+)=["'](.*?)["']/g)];
  for (const attr_match of attr_matches) {
    a_props[attr_match[1]] = attr_match[2];
  }
  
  if (a_props.async === '') a_props.async = true;

  return <Script {...a_props}>{inner_html}</Script>;
};


async function VerificationTags() {
  const tags = await getVerificationTags();
  
  // Extract content from google-site-verification meta tag
  const verificationContent = tags.googleSiteVerification.match(/content="([^"]*)"/)?.[1];
  
  return (
    <>
      {verificationContent && (
        <meta name="google-site-verification" content={verificationContent} />
      )}
      {tags.googleAnalytics && !tags.googleAnalytics.includes('<!--') && (
        <Suspense fallback={null}>
          <RawHtmlScript html={tags.googleAnalytics} />
        </Suspense>
      )}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <Suspense fallback={null}>
          <VerificationTags />
        </Suspense>
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
