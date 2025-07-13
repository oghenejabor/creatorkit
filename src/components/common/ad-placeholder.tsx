'use client';

import { useEffect, useState, useRef } from 'react';
import { getAdContent } from '@/lib/ad-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function AdPlaceholder({ adKey }: { adKey: string }) {
  const [adCode, setAdCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAdCode() {
      try {
        const code = await getAdContent(adKey);
        // Only update if there's actual code, not the default comment
        if (code && !code.trim().startsWith('<!--')) {
          setAdCode(code);
        } else {
          setAdCode(''); // Set to empty to stop loading and render nothing
        }
      } catch (error) {
        console.error('Failed to fetch ad code:', error);
        setAdCode(''); 
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdCode();
  }, [adKey]);
  
  useEffect(() => {
    // We only proceed if we have adCode and the container ref is available.
    if (adCode && adContainerRef.current) {
      const container = adContainerRef.current;
      container.innerHTML = ''; // Clear previous ad content

      const fragment = document.createRange().createContextualFragment(adCode);
      
      // NodeLists are live, so we convert to an array to safely manipulate the DOM
      const nodes = Array.from(fragment.childNodes);

      nodes.forEach(node => {
        if (node.nodeName.toLowerCase() === 'script') {
            const script = node as HTMLScriptElement;
            const newScript = document.createElement('script');
            
            // Copy attributes like src, async, etc.
            for (let i = 0; i < script.attributes.length; i++) {
                const attr = script.attributes[i];
                newScript.setAttribute(attr.name, attr.value);
            }
            
            // Copy inline script content
            if (script.innerHTML) {
                newScript.appendChild(document.createTextNode(script.innerHTML));
            }

            container.appendChild(newScript);
        } else {
            // Append non-script elements directly
            container.appendChild(node.cloneNode(true));
        }
      });
      
      // Specifically for AdSense, their push needs to be re-run for dynamically loaded ads.
      try {
        if (typeof (window as any).adsbygoogle !== 'undefined') {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    }
  }, [adCode]);

  if (isLoading) {
    return <Skeleton className="h-[100px] w-full mt-8" />;
  }

  // If there's no ad code, don't render the card at all.
  if (!adCode) {
    return null;
  }

  return (
    <Card className="mt-8 bg-transparent border-dashed">
      <CardContent className="p-4 flex justify-center items-center">
        <div
          ref={adContainerRef}
          className="w-full text-center"
        />
      </CardContent>
    </Card>
  );
}
