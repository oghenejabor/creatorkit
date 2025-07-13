'use server';

/**
 * @fileOverview A Genkit flow for generating SEO-optimized YouTube tags.
 *
 * - generateYoutubeTags - A function that generates tags from video context.
 * - GenerateYoutubeTagsInput - The input type for the generateYoutubeTags function.
 * - GenerateYoutubeTagsOutput - The return type for the generateYoutubeTags function.
 */

import { ai_defineFlow, ai_generate } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateYoutubeTagsInputSchema = z.object({
  videoContext: z.string().describe('The title, topic, or description of the YouTube video.'),
});
export type GenerateYoutubeTagsInput = z.infer<typeof GenerateYoutubeTagsInputSchema>;

const GenerateYoutubeTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('A list of 20-30 SEO-optimized tags for the video.'),
});
export type GenerateYoutubeTagsOutput = z.infer<typeof GenerateYoutubeTagsOutputSchema>;

export async function generateYoutubeTags(
  input: GenerateYoutubeTagsInput
): Promise<GenerateYoutubeTagsOutput> {
  const generateYoutubeTagsFlow = await ai_defineFlow(
    {
      name: 'generateYoutubeTagsFlow',
      inputSchema: GenerateYoutubeTagsInputSchema,
      outputSchema: GenerateYoutubeTagsOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateYoutubeTags'),
        getModelConfig('generateYoutubeTags'),
      ]);
      
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const { output } = await ai_generate({
        prompt: filledPrompt,
        model: modelConfig.model,
        output: { schema: GenerateYoutubeTagsOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate YouTube tags.');
      }
      
      return output;
    }
  );
  return generateYoutubeTagsFlow(input);
}
