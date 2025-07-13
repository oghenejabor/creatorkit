'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating creative thumbnail prompts using Gemini AI.
 *
 * - generateThumbnailPrompt - A function that generates a thumbnail prompt from a video title, description, and optional face image.
 * - GenerateThumbnailPromptInput - The input type for the generateThumbnailPrompt function.
 * - GenerateThumbnailPromptOutput - The return type for the generateThumbnailPrompt function.
 */

import {ai} from '@/lib/genkit-service';
import {z} from 'genkit';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateThumbnailPromptInputSchema = z.object({
  title: z.string().describe('The title of the YouTube video.'),
  description: z.string().describe('The description of the YouTube video.'),
  faceDataUri: z
    .string()
    .optional()
    .describe(
      "Optional: A face image to blend into the thumbnail, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  textOverlay: z
    .string()
    .optional()
    .describe('Text to overlay on the thumbnail.'),
  fontFamily: z
    .string()
    .optional()
    .describe('Font family for the overlay text.'),
  fontSize: z.number().optional().describe('Font size for the overlay text.'),
  fontColor: z
    .string()
    .optional()
    .describe('Font color for the overlay text (hex code).'),
});
export type GenerateThumbnailPromptInput = z.infer<typeof GenerateThumbnailPromptInputSchema>;

const GenerateThumbnailPromptOutputSchema = z.object({
  prompt: z.string().describe('A creative thumbnail prompt for an AI image generator.'),
});
export type GenerateThumbnailPromptOutput = z.infer<typeof GenerateThumbnailPromptOutputSchema>;

export async function generateThumbnailPrompt(
  input: GenerateThumbnailPromptInput
): Promise<GenerateThumbnailPromptOutput> {
  const generateThumbnailPromptFlow = ai.defineFlow(
    {
      name: 'generateThumbnailPromptFlow',
      inputSchema: GenerateThumbnailPromptInputSchema,
      outputSchema: GenerateThumbnailPromptOutputSchema,
    },
    async input => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateThumbnailPrompt'),
        getModelConfig('generateThumbnailPrompt')
      ]);

      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const generate = await ai.getGenerator(modelConfig.model);
      const { output } = await generate({
        prompt: filledPrompt,
        output: { schema: GenerateThumbnailPromptOutputSchema },
      });
      return output!;
    }
  );
  return generateThumbnailPromptFlow(input);
}
