export interface VerificationTags {
  googleSiteVerification: string;
  googleAnalytics: string;
}

export const defaultVerificationTags: VerificationTags = {
  googleSiteVerification: '<!-- Paste your Google site verification meta tag here. Example: <meta name="google-site-verification" content="YOUR_UNIQUE_CODE" /> -->',
  googleAnalytics: '<!-- Paste your Google Analytics (GA4) gtag.js script here. -->',
};
