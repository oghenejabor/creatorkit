'use server';

import { get, ref, set } from 'firebase/database';
import { database } from './firebase';
import { defaultAdContent } from './ad-defaults';

const adCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function getAdContent(key: string): Promise<string> {
  const cachedItem = adCache.get(key);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION_MS) {
    return cachedItem.value;
  }

  try {
    const adRef = ref(database, `ads/${key}`);
    const snapshot = await get(adRef);
    if (snapshot.exists()) {
      const content = snapshot.val();
      adCache.set(key, { value: content, timestamp: Date.now() });
      return content;
    }
  } catch (error) {
    console.error(`Error fetching ad content for '${key}' from Firebase:`, error);
  }

  const defaultContent = defaultAdContent[key] || '';
  adCache.set(key, { value: defaultContent, timestamp: Date.now() });
  return defaultContent;
}

export async function getAllAdContent(): Promise<Record<string, string>> {
    const content: Record<string, string> = {};
    const adKeys = Object.keys(defaultAdContent);

    for (const key of adKeys) {
        content[key] = await getAdContent(key);
    }
    
    return content;
}

export async function updateAdContent(key: string, value: string): Promise<void> {
  try {
    const adRef = ref(database, `ads/${key}`);
    await set(adRef, value);
    adCache.set(key, { value, timestamp: Date.now() });
  } catch (error) {
    console.error(`Error updating ad content for '${key}' in Firebase:`, error);
    throw new Error('Failed to update ad content in Firebase.');
  }
}
