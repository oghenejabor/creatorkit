export interface ModelConfig {
  model: string;
  availableModels: string[];
}

export const defaultModelConfigs: Record<string, ModelConfig> = {
  enhanceSeo: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateAso: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateThumbnailPrompt: {
    model: 'googleai/gemini-2.0-flash',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  rewriteScript: {
    model: 'googleai/gemini-2.0-flash',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  suggestOverlayText: {
    model: 'googleai/gemini-2.0-flash',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateAppIcon: {
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    availableModels: ['googleai/gemini-2.0-flash-preview-image-generation'],
  },
  generateThumbnail: {
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    availableModels: ['googleai/gemini-2.0-flash-preview-image-generation'],
  },
  translateAppMetadata: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateYoutubeTags: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateYoutubeTitles: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateTiktokHook: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateTiktokCaption: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateTiktokHashtag: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateTiktokVideoIdea: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateTiktokScript: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateTiktokVoiceover: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateTiktokBio: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateTiktokCta: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generateVeoPrompt: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
  generatePrivacyPolicy: {
    model: 'googleai/gemini-1.5-flash-latest',
    availableModels: ['googleai/gemini-1.5-flash-latest', 'googleai/gemini-2.0-flash'],
  },
};
