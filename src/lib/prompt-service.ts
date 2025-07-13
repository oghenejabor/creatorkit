// @/lib/prompt-service.ts
'use server';

import { get, ref, set } from 'firebase/database';
import { database } from './firebase';
import { defaultPrompts } from './prompt-defaults';

// Simple in-memory cache to avoid repeated DB calls for the same prompt within a short time.
const promptCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function getPrompt(key: string): Promise<string> {
  const cachedItem = promptCache.get(key);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION_MS) {
    return cachedItem.value;
  }

  try {
    const promptRef = ref(database, `prompts/${key}`);
    const snapshot = await get(promptRef);
    if (snapshot.exists()) {
      const prompt = snapshot.val();
      promptCache.set(key, { value: prompt, timestamp: Date.now() });
      return prompt;
    }
  } catch (error) {
    console.error(`Error fetching prompt '${key}' from Firebase:`, error);
  }

  // Fallback to default if not in DB or if there's an error
  const defaultPrompt = defaultPrompts[key] || '';
  promptCache.set(key, { value: defaultPrompt, timestamp: Date.now() });
  return defaultPrompt;
}

export async function getAllPrompts(): Promise<Record<string, string>> {
  const prompts: Record<string, string> = {};
  const promptKeys = Object.keys(defaultPrompts);

  for (const key of promptKeys) {
    prompts[key] = await getPrompt(key);
  }

  return prompts;
}

export async function updatePrompt(key: string, value: string): Promise<void> {
  try {
    const promptRef = ref(database, `prompts/${key}`);
    await set(promptRef, value);
    promptCache.set(key, { value, timestamp: Date.now() }); // Update cache immediately
  } catch (error) {
    console.error(`Error updating prompt '${key}' in Firebase:`, error);
    throw new Error('Failed to update prompt in Firebase.');
  }
}
