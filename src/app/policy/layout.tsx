import React from 'react';

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
  // This layout prevents the public policy pages from inheriting the main tools layout.
  return <>{children}</>;
}
