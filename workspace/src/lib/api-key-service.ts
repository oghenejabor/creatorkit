
'use server';

import { get, ref } from 'firebase/database';
import { database } from './firebase';

interface ApiKeys {
  GOOGLE_API_KEY: string;
  YOUTUBE_API_KEY: string;
}

// Simple in-memory cache to avoid repeated DB calls for the same key.
const apiKeyCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

async function getApiKey(key: keyof ApiKeys): Promise<string> {
  const cachedItem = apiKeyCache.get(key);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION_MS) {
    return cachedItem.value;
  }

  try {
    const keyRef = ref(database, `api/${key}`);
    const snapshot = await get(keyRef);
    if (snapshot.exists()) {
      const value = snapshot.val();
      if (typeof value === 'string') {
        apiKeyCache.set(key, { value, timestamp: Date.now() });
        return value;
      }
    }
    throw new Error(`API key '${key}' not found or is not a string in Firebase.`);
  } catch (error) {
    console.error(`Error fetching API key '${key}' from Firebase:`, error);
    throw error;
  }
}

export async function getGoogleApiKey() {
  return getApiKey('GOOGLE_API_KEY');
}
export async function getYoutubeApiKey() {
  return getApiKey('YOUTUBE_API_KEY');
}
