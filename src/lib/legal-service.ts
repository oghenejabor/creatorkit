// @/lib/legal-service.ts
'use server';

import { get, ref, set } from 'firebase/database';
import { database } from './firebase';
import { defaultLegalContent } from './legal-defaults';

// Simple in-memory cache
const legalCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function getLegalContent(key: string): Promise<string> {
  const cachedItem = legalCache.get(key);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION_MS) {
    return cachedItem.value;
  }

  try {
    const legalRef = ref(database, `legal/${key}`);
    const snapshot = await get(legalRef);
    if (snapshot.exists()) {
      const content = snapshot.val();
      legalCache.set(key, { value: content, timestamp: Date.now() });
      return content;
    }
  } catch (error) {
    console.error(`Error fetching legal content for '${key}' from Firebase:`, error);
  }

  // Fallback to default
  const defaultContent = defaultLegalContent[key] || '';
  legalCache.set(key, { value: defaultContent, timestamp: Date.now() });
  return defaultContent;
}

export async function getAllLegalContent(): Promise<Record<string, string>> {
  const content: Record<string, string> = {};
  const legalKeys = Object.keys(defaultLegalContent);

  for (const key of legalKeys) {
    content[key] = await getLegalContent(key);
  }

  return content;
}

export async function updateLegalContent(key: string, value: string): Promise<void> {
  try {
    const legalRef = ref(database, `legal/${key}`);
    await set(legalRef, value);
    legalCache.set(key, { value, timestamp: Date.now() }); // Update cache immediately
  } catch (error) {
    console.error(`Error updating legal content for '${key}' in Firebase:`, error);
    throw new Error('Failed to update legal content in Firebase.');
  }
}
