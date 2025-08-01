
'use server';

import { get, ref, set } from 'firebase/database';
import { database } from './firebase';
import { defaultSiteConfig, type SiteConfig } from './site-config-defaults';

const configCache = new Map<string, { value: SiteConfig; timestamp: number }>();
const CACHE_KEY = 'siteConfig';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function getSiteConfig(): Promise<SiteConfig> {
  const cachedItem = configCache.get(CACHE_KEY);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION_MS) {
    return cachedItem.value;
  }

  try {
    const configRef = ref(database, 'siteConfig');
    const snapshot = await get(configRef);
    if (snapshot.exists() && snapshot.val()) {
      const config = snapshot.val();
      configCache.set(CACHE_KEY, { value: config, timestamp: Date.now() });
      return config;
    }
  } catch (error) {
    console.error('Error fetching site config from Firebase:', error);
  }

  // Fallback to default
  configCache.set(CACHE_KEY, { value: defaultSiteConfig, timestamp: Date.now() });
  return defaultSiteConfig;
}

export async function updateSiteConfig(config: SiteConfig): Promise<void> {
  try {
    const configRef = ref(database, 'siteConfig');
    await set(configRef, config);
    configCache.set(CACHE_KEY, { value: config, timestamp: Date.now() });
  } catch (error) {
    console.error('Error updating site config in Firebase:', error);
    throw new Error('Failed to update site config in Firebase.');
  }
}
