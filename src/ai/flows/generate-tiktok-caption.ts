'use server';

/**
 * @fileOverview A Genkit flow for generating viral-style TikTok captions.
 *
 * - generateTiktokCaption - Generates a TikTok caption.
 * - GenerateTiktokCaptionInput - The input type for the generateTiktokCaption function.
 * - GenerateTiktokCaptionOutput - The return type for the generateTiktokCaption function.
 */

import { ai_defineFlow, ai_generate } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateTiktokCaptionInputSchema = z.object({
  videoSummary: z.string().describe('A summary of the video content or relevant keywords.'),
});
export type GenerateTiktokCaptionInput = z.infer<typeof GenerateTiktokCaptionInputSchema>;

const GenerateTiktokCaptionOutputSchema = z.object({
  captions: z.array(z.string()).describe('A list of 3-5 viral-style captions with emojis and hashtags.'),
});
export type GenerateTiktokCaptionOutput = z.infer<typeof GenerateTiktokCaptionOutputSchema>;

export async function generateTiktokCaption(input: GenerateTiktokCaptionInput): Promise<GenerateTiktokCaptionOutput> {
  const generateTiktokCaptionFlow = await ai_defineFlow(
    {
      name: 'generateTiktokCaptionFlow',
      inputSchema: GenerateTiktokCaptionInputSchema,
      outputSchema: GenerateTiktokCaptionOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateTiktokCaption'),
        getModelConfig('generateTiktokCaption'),
      ]);
      
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const { output } = await ai_generate({
        prompt: filledPrompt,
        model: modelConfig.model,
        output: { schema: GenerateTiktokCaptionOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate TikTok captions.');
      }
      
      return output;
    }
  );
  return generateTiktokCaptionFlow(input);
}
