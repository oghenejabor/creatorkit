'use server';

import { genkit, GenkitError } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { get, ref } from 'firebase/database';
import { database } from './firebase';

// --- API Key Service Logic ---
interface ApiKeys {
  GOOGLE_API_KEY: string;
  YOUTUBE_API_KEY: string;
}

const apiKeyCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

async function getApiKeyFromServer(key: keyof ApiKeys): Promise<string> {
    const value = process.env[key];
    if (value) {
        return value;
    }
    
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


export async function getGoogleApiKey(): Promise<string> {
  return getApiKeyFromServer('GOOGLE_API_KEY');
}

export async function getYoutubeApiKey(): Promise<string> {
  return getApiKeyFromServer('YOUTUBE_API_KEY');
}


// --- Genkit Initialization Logic ---
let aiInstance: any;

async function initializeGenkit() {
  if (aiInstance) {
    return aiInstance;
  }

  try {
    const apiKey = await getGoogleApiKey();
    if (!apiKey) {
      throw new GenkitError({
        source: 'genkit-init',
        status: 'UNAUTHENTICATED',
        message: 'GOOGLE_API_KEY is missing from the database or environment.',
      });
    }

    aiInstance = genkit({
      plugins: [
        googleAI({
          apiKey: apiKey,
        }),
      ],
      model: 'googleai/gemini-2.0-flash',
    });
    return aiInstance;
  } catch (e) {
    console.error('Failed to initialize Genkit', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    throw new GenkitError({
      source: 'genkit-init',
      status: 'INTERNAL',
      message: `Genkit failed to initialize due to an error fetching credentials: ${errorMessage}`,
    });
  }
}

// Export async functions that wrap genkit methods
export async function ai_generate(options: any) {
    const instance = await initializeGenkit();
    return instance.generate(options);
}

export async function ai_defineFlow(options: any, fn: any) {
    const instance = await initializeGenkit();
    return instance.defineFlow(options, fn);
}
