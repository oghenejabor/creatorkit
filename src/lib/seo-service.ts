'use server';

import { get, ref, set } from 'firebase/database';
import { database } from './firebase';
import { defaultSeoData, type SeoData } from './seo-defaults';

const seoCache = new Map<string, { value: SeoData; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function getSeoData(key: string): Promise<SeoData> {
  const cachedItem = seoCache.get(key);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION_MS) {
    return cachedItem.value;
  }

  try {
    const seoRef = ref(database, `seo/${key}`);
    const snapshot = await get(seoRef);
    if (snapshot.exists()) {
      const seoData = snapshot.val();
      // Ensure keywords is an array, as Firebase might store it differently if it was an empty text submission.
      if (typeof seoData.keywords === 'string') {
          seoData.keywords = seoData.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      }
      seoCache.set(key, { value: seoData, timestamp: Date.now() });
      return seoData;
    }
  } catch (error) {
    console.error(`Error fetching SEO data for '${key}' from Firebase:`, error);
  }

  const defaultData = defaultSeoData[key];
  if (defaultData) {
    seoCache.set(key, { value: defaultData, timestamp: Date.now() });
    return defaultData;
  }

  throw new Error(`No default SEO data found for key: ${key}`);
}

export async function getAllSeoData(): Promise<Record<string, SeoData>> {
  const seoData: Record<string, SeoData> = {};
  const seoKeys = Object.keys(defaultSeoData);

  for (const key of seoKeys) {
    seoData[key] = await getSeoData(key);
  }

  return seoData;
}

export async function updateSeoData(key: string, data: SeoData): Promise<void> {
  try {
    const seoRef = ref(database, `seo/${key}`);
    // Ensure keywords are stored as an array.
    const keywordsAsArray = typeof data.keywords === 'string'
        ? (data.keywords as string).split(',').map(k => k.trim()).filter(Boolean)
        : data.keywords;
        
    const dataToSave = { ...data, keywords: keywordsAsArray };

    await set(seoRef, dataToSave);
    seoCache.set(key, { value: dataToSave, timestamp: Date.now() });
  } catch (error) {
    console.error(`Error updating SEO data for '${key}' in Firebase:`, error);
    throw new Error('Failed to update SEO data in Firebase.');
  }
}
