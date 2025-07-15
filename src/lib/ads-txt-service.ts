
'use server';

import { get, ref, set } from 'firebase/database';
import { database } from './firebase';
import { defaultAdsTxtContent } from './ads-txt-defaults';

const adsTxtCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_KEY = 'adsTxtContent';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function getAdsTxtContent(): Promise<string> {
  const cachedItem = adsTxtCache.get(CACHE_KEY);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION_MS) {
    return cachedItem.value;
  }

  try {
    const adsTxtRef = ref(database, 'adsTxt/content');
    const snapshot = await get(adsTxtRef);
    if (snapshot.exists() && snapshot.val()) {
      const content = snapshot.val();
      adsTxtCache.set(CACHE_KEY, { value: content, timestamp: Date.now() });
      return content;
    }
  } catch (error) {
    console.error('Error fetching ads.txt content from Firebase:', error);
  }

  // Fallback to default
  adsTxtCache.set(CACHE_KEY, { value: defaultAdsTxtContent, timestamp: Date.now() });
  return defaultAdsTxtContent;
}

export async function updateAdsTxtContent(value: string): Promise<void> {
  try {
    const adsTxtRef = ref(database, 'adsTxt/content');
    await set(adsTxtRef, value);
    adsTxtCache.set(CACHE_KEY, { value, timestamp: Date.now() });
  } catch (error) {
    console.error('Error updating ads.txt content in Firebase:', error);
    throw new Error('Failed to update ads.txt content in Firebase.');
  }
}
