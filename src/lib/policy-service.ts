
'use server';

import { get, ref, set } from 'firebase/database';
import { database } from './firebase';
import { randomUUID } from 'crypto';

export interface SavedPolicy {
  content: string;
  type: 'privacyPolicy' | 'termsAndConditions';
}

export async function savePolicy(content: string, type: 'privacyPolicy' | 'termsAndConditions'): Promise<string> {
  try {
    if (!content) {
      throw new Error("Content cannot be empty.");
    }
    
    const policyId = randomUUID();
    const policyRef = ref(database, `appprivacypolicygenerator/${policyId}`);
    
    const dataToSave = {
      content: content,
      type: type,
    };

    await set(policyRef, dataToSave);
    
    return policyId;
  } catch (error) {
    console.error('Error saving policy to Firebase:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while saving.';
    throw new Error(`Failed to save to Firebase. This is often due to database security rules. Please check that public writes are allowed for the '/appprivacypolicygenerator' path. Original error: ${errorMessage}`);
  }
}

export async function getPolicy(policyId: string): Promise<SavedPolicy | null> {
    try {
        const policyRef = ref(database, `appprivacypolicygenerator/${policyId}`);
        const snapshot = await get(policyRef);
        if (snapshot.exists()) {
            return snapshot.val() as SavedPolicy;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching policy '${policyId}' from Firebase:`, error);
        return null;
    }
}
