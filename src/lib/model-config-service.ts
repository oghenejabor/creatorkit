'use server';

import { get, ref, set } from 'firebase/database';
import { database } from './firebase';
import { defaultModelConfigs, type ModelConfig } from './model-config-defaults';

const modelConfigCache = new Map<string, { value: ModelConfig; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function getModelConfig(key: string): Promise<ModelConfig> {
  const cachedItem = modelConfigCache.get(key);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION_MS) {
    return cachedItem.value;
  }

  try {
    const modelConfigRef = ref(database, `modelConfigs/${key}`);
    const snapshot = await get(modelConfigRef);
    if (snapshot.exists()) {
      const config = snapshot.val();
      modelConfigCache.set(key, { value: config, timestamp: Date.now() });
      return config;
    }
  } catch (error) {
    console.error(`Error fetching model config for '${key}' from Firebase:`, error);
  }

  const defaultConfig = defaultModelConfigs[key];
  if (defaultConfig) {
      modelConfigCache.set(key, { value: defaultConfig, timestamp: Date.now() });
      return defaultConfig;
  }
  
  throw new Error(`No default model config found for key: ${key}`);
}

export async function getAllModelConfigs(): Promise<Record<string, ModelConfig>> {
  const configs: Record<string, ModelConfig> = {};
  const configKeys = Object.keys(defaultModelConfigs);

  const promises = configKeys.map(key => getModelConfig(key));
  const results = await Promise.all(promises);

  configKeys.forEach((key, index) => {
    configs[key] = results[index];
  });

  return configs;
}

export async function updateModelConfig(key: string, value: ModelConfig): Promise<void> {
  try {
    const modelConfigRef = ref(database, `modelConfigs/${key}`);
    await set(modelConfigRef, value);
    modelConfigCache.set(key, { value, timestamp: Date.now() });
  } catch (error) {
    console.error(`Error updating model config for '${key}' in Firebase:`, error);
    throw new Error('Failed to update model config in Firebase.');
  }
}
