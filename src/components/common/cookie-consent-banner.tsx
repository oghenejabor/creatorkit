
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie_consent_is_true';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check localStorage only on the client side
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'true') {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-lg border bg-background/95 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Cookie className="h-6 w-6 shrink-0 text-primary" />
              <p className="text-sm text-foreground">
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                <Link href="/cookie-policy" className="ml-2 inline-block font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  Learn more
                </Link>
              </p>
            </div>
            <Button size="sm" onClick={handleAccept}>
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
