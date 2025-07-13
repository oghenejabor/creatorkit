'use server';

/**
 * @fileOverview A Genkit flow for generating a catchy TikTok bio.
 *
 * - generateTiktokBio - Generates a TikTok bio.
 * - GenerateTiktokBioInput - The input type for the generateTiktokBio function.
 * - GenerateTiktokBioOutput - The return type for the generateTiktokBio function.
 */

import { ai } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateTiktokBioInputSchema = z.object({
  description: z.string().describe('A description of what the user does, what they sell, or their niche.'),
});
export type GenerateTiktokBioInput = z.infer<typeof GenerateTiktokBioInputSchema>;

const GenerateTiktokBioOutputSchema = z.object({
  bio: z.string().describe('A catchy TikTok bio with emojis and a call-to-action.'),
});
export type GenerateTiktokBioOutput = z.infer<typeof GenerateTiktokBioOutputSchema>;

export async function generateTiktokBio(input: GenerateTiktokBioInput): Promise<GenerateTiktokBioOutput> {
  const generateTiktokBioFlow = ai.defineFlow(
    {
      name: 'generateTiktokBioFlow',
      inputSchema: GenerateTiktokBioInputSchema,
      outputSchema: GenerateTiktokBioOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateTiktokBio'),
        getModelConfig('generateTiktokBio'),
      ]);
      
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const generate = await ai.getGenerator(modelConfig.model);
      const { output } = await generate({
        prompt: filledPrompt,
        output: { schema: GenerateTiktokBioOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate a TikTok bio.');
      }
      
      return output;
    }
  );
  return generateTiktokBioFlow(input);
}
