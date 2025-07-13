'use server';

/**
 * @fileOverview A Genkit flow for generating app icons.
 *
 * - generateAppIcon - A function that generates three variations of an app icon.
 * - GenerateAppIconInput - The input type for the generateAppIcon function.
 * - GenerateAppIconOutput - The return type for the generateAppIcon function.
 */

import { ai } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateAppIconInputSchema = z.object({
  appName: z.string().describe('The name of the app.'),
  iconDescription: z.string().describe('A detailed description of the desired icon concept, style, and elements.'),
  primaryColor: z.string().optional().describe('An optional primary color for the icon in HEX format (e.g., "#FF5733").'),
});
export type GenerateAppIconInput = z.infer<typeof GenerateAppIconInputSchema>;

const GenerateAppIconOutputSchema = z.object({
  icons: z.array(z.string().describe('A data URI of a generated 512x512 app icon.')),
});
export type GenerateAppIconOutput = z.infer<typeof GenerateAppIconOutputSchema>;

export async function generateAppIcon(input: GenerateAppIconInput): Promise<GenerateAppIconOutput> {
  const generateAppIconFlow = ai.defineFlow(
    {
      name: 'generateAppIconFlow',
      inputSchema: GenerateAppIconInputSchema,
      outputSchema: GenerateAppIconOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
          getPrompt('generateAppIcon'),
          getModelConfig('generateAppIcon')
      ]);
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const generate = await ai.getGenerator(modelConfig.model);

      // Generate 3 icons in parallel
      const imagePromises = Array(3).fill(null).map(() => 
        generate({
          prompt: filledPrompt,
          config: { responseModalities: ['TEXT', 'IMAGE'] },
        })
      );

      const results = await Promise.allSettled(imagePromises);
      
      const icons = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && !!result.value.media?.url)
        .map(result => result.value.media.url);

      if (icons.length === 0) {
        throw new Error('AI failed to generate any app icon images. This might be due to safety filters or a temporary issue. Please try again with a different description.');
      }

      return { icons };
    }
  );
  return generateAppIconFlow(input);
}
