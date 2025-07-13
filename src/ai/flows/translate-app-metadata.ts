'use server';

/**
 * @fileOverview A Genkit flow for translating app metadata into multiple languages.
 *
 * - translateAppMetadata - A function that translates app metadata.
 * - TranslateAppMetadataInput - The input type for the translateAppMetadata function.
 * - TranslateAppMetadataOutput - The return type for the translateAppmetadata function.
 */

import { ai_defineFlow, ai_generate } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';
import { supportedLanguages } from '@/lib/languages';

const TranslationSchema = z.object({
  languageCode: z.string().describe("The language code for this translation, e.g., 'es'."),
  languageName: z.string().describe("The full name of the language, e.g., 'Spanish'."),
  title: z.string().describe("The translated app title (max 30 characters)."),
  shortDescription: z.string().describe("The translated short description (max 80 characters)."),
  longDescription: z.string().describe("The translated long description (max 4000 characters)."),
});

const TranslateAppMetadataInputSchema = z.object({
  title: z.string().describe('The original app title in English.'),
  shortDescription: z.string().describe('The original short description in English.'),
  longDescription: z.string().describe('The original long description in English.'),
  languages: z.array(z.string()).describe('A list of language codes to translate to.'),
});
export type TranslateAppMetadataInput = z.infer<typeof TranslateAppMetadataInputSchema>;

const TranslateAppMetadataOutputSchema = z.object({
    translations: z.array(TranslationSchema).describe('An array containing the translation for each requested language.')
});
export type TranslateAppMetadataOutput = z.infer<typeof TranslateAppMetadataOutputSchema>;


export async function translateAppMetadata(
  input: TranslateAppMetadataInput
): Promise<TranslateAppMetadataOutput> {
  const translateAppMetadataFlow = await ai_defineFlow(
    {
      name: 'translateAppMetadataFlow',
      inputSchema: TranslateAppMetadataInputSchema,
      outputSchema: TranslateAppMetadataOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('translateAppMetadata'),
        getModelConfig('translateAppMetadata'),
      ]);
      
      const languagesToTranslate = input.languages.reduce((acc, langCode) => {
          const langName = supportedLanguages[langCode as keyof typeof supportedLanguages];
          if (langName) {
              acc[langCode] = langName;
          }
          return acc;
      }, {} as Record<string, string>);

      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template({
          ...input,
          languages: JSON.stringify(languagesToTranslate, null, 2)
      });
      
      const { output } = await ai_generate({
        prompt: filledPrompt,
        model: modelConfig.model,
        output: { schema: TranslateAppMetadataOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate translations.');
      }
      
      return output;
    }
  );
  return translateAppMetadataFlow(input);
}
