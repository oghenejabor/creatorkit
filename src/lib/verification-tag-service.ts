'use server';

import { get, ref, set } from 'firebase/database';
import { database } from './firebase';
import { defaultVerificationTags, type VerificationTags } from './verification-tag-defaults';

const verificationCache = new Map<string, { value: VerificationTags; timestamp: number }>();
const CACHE_KEY = 'verificationTags';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function getVerificationTags(): Promise<VerificationTags> {
  const cachedItem = verificationCache.get(CACHE_KEY);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION_MS) {
    return cachedItem.value;
  }

  try {
    const tagsRef = ref(database, 'verificationTags');
    const snapshot = await get(tagsRef);
    if (snapshot.exists()) {
      const tags = snapshot.val();
      verificationCache.set(CACHE_KEY, { value: tags, timestamp: Date.now() });
      return tags;
    }
  } catch (error) {
    console.error('Error fetching verification tags from Firebase:', error);
  }

  // Fallback to default if not in DB or if there's an error
  verificationCache.set(CACHE_KEY, { value: defaultVerificationTags, timestamp: Date.now() });
  return defaultVerificationTags;
}

export async function updateVerificationTags(tags: VerificationTags): Promise<void> {
  try {
    const tagsRef = ref(database, 'verificationTags');
    await set(tagsRef, tags);
    verificationCache.set(CACHE_KEY, { value: tags, timestamp: Date.now() });
  } catch (error) {
    console.error('Error updating verification tags in Firebase:', error);
    throw new Error('Failed to update verification tags in Firebase.');
  }
}
