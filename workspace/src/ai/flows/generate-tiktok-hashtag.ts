'use server';

/**
 * @fileOverview A Genkit flow for generating relevant and trending TikTok hashtags.
 *
 * - generateTiktokHashtag - Generates TikTok hashtags.
 * - GenerateTiktokHashtagInput - The input type for this function.
 * - GenerateTiktokHashtagOutput - The return type for this function.
 */

import { ai } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateTiktokHashtagInputSchema = z.object({
  topic: z.string().describe('The topic, niche, or keywords for the video.'),
});
export type GenerateTiktokHashtagInput = z.infer<typeof GenerateTiktokHashtagInputSchema>;

const GenerateTiktokHashtagOutputSchema = z.object({
  hashtags: z.array(z.string()).describe('A list of 15-20 relevant, trending hashtags.'),
});
export type GenerateTiktokHashtagOutput = z.infer<typeof GenerateTiktokHashtagOutputSchema>;

export async function generateTiktokHashtag(input: GenerateTiktokHashtagInput): Promise<GenerateTiktokHashtagOutput> {
  const generateTiktokHashtagFlow = ai.defineFlow(
    {
      name: 'generateTiktokHashtagFlow',
      inputSchema: GenerateTiktokHashtagInputSchema,
      outputSchema: GenerateTiktokHashtagOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateTiktokHashtag'),
        getModelConfig('generateTiktokHashtag'),
      ]);
      
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const generate = await ai.getGenerator(modelConfig.model);
      const { output } = await generate({
        prompt: filledPrompt,
        output: { schema: GenerateTiktokHashtagOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate TikTok hashtags.');
      }
      
      return output;
    }
  );
  return generateTiktokHashtagFlow(input);
}
