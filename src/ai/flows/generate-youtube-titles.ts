'use server';

/**
 * @fileOverview A Genkit flow for generating SEO-optimized YouTube video titles.
 *
 * - generateYoutubeTitles - A function that generates titles from a video topic or script.
 * - GenerateYoutubeTitlesInput - The input type for the generateYoutubeTitles function.
 * - GenerateYoutubeTitlesOutput - The return type for the generateYoutubeTitles function.
 */

import { ai_defineFlow, ai_generate } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateYoutubeTitlesInputSchema = z.object({
  videoTopic: z.string().describe('The topic, subject, or full script of the YouTube video.'),
});
export type GenerateYoutubeTitlesInput = z.infer<typeof GenerateYoutubeTitlesInputSchema>;

const GenerateYoutubeTitlesOutputSchema = z.object({
  titles: z.array(z.string()).describe('A list of 5-10 catchy, SEO-optimized video titles.'),
});
export type GenerateYoutubeTitlesOutput = z.infer<typeof GenerateYoutubeTitlesOutputSchema>;

export async function generateYoutubeTitles(
  input: GenerateYoutubeTitlesInput
): Promise<GenerateYoutubeTitlesOutput> {
  const generateYoutubeTitlesFlow = await ai_defineFlow(
    {
      name: 'generateYoutubeTitlesFlow',
      inputSchema: GenerateYoutubeTitlesInputSchema,
      outputSchema: GenerateYoutubeTitlesOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateYoutubeTitles'),
        getModelConfig('generateYoutubeTitles'),
      ]);
      
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const { output } = await ai_generate({
        prompt: filledPrompt,
        model: modelConfig.model,
        output: { schema: GenerateYoutubeTitlesOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate YouTube titles.');
      }
      
      return output;
    }
  );
  return generateYoutubeTitlesFlow(input);
}
