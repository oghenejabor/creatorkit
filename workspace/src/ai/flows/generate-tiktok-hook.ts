'use server';

/**
 * @fileOverview A Genkit flow for generating engaging hooks for TikTok videos.
 *
 * - generateTiktokHook - Generates TikTok hooks.
 * - GenerateTiktokHookInput - The input type for this function.
 * - GenerateTiktokHookOutput - The return type for this function.
 */

import { ai } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateTiktokHookInputSchema = z.object({
  topic: z.string().describe('The topic or main idea of the TikTok video.'),
});
export type GenerateTiktokHookInput = z.infer<typeof GenerateTiktokHookInputSchema>;

const GenerateTiktokHookOutputSchema = z.object({
  hooks: z.array(z.string()).describe('A list of 5-10 engaging first-line hooks to grab attention in the first 3 seconds.'),
});
export type GenerateTiktokHookOutput = z.infer<typeof GenerateTiktokHookOutputSchema>;

export async function generateTiktokHook(input: GenerateTiktokHookInput): Promise<GenerateTiktokHookOutput> {
  const generateTiktokHookFlow = ai.defineFlow(
    {
      name: 'generateTiktokHookFlow',
      inputSchema: GenerateTiktokHookInputSchema,
      outputSchema: GenerateTiktokHookOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateTiktokHook'),
        getModelConfig('generateTiktokHook'),
      ]);
      
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const generate = await ai.getGenerator(modelConfig.model);
      const { output } = await generate({
        prompt: filledPrompt,
        output: { schema: GenerateTiktokHookOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate TikTok hooks.');
      }
      
      return output;
    }
  );
  return generateTiktokHookFlow(input);
}
