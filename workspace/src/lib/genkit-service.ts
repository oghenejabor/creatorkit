// src/lib/genkit-service.ts
'use server';

import { genkit, GenkitError } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getGoogleApiKey } from '@/lib/api-key-service';

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
        message: 'GOOGLE_API_KEY is missing from the database.',
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

// We export a proxy object that will dynamically call the initialized instance.
// This ensures that `initializeGenkit` is awaited correctly in our server-side flows.
export const ai = new Proxy(
  {},
  {
    get: (target, prop) => {
      return async (...args: any[]) => {
        const instance = await initializeGenkit();
        const method = Reflect.get(instance, prop);
        if (typeof method === 'function') {
          return method.apply(instance, args);
        }
        return method;
      };
    },
  }
) as any;
