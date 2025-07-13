'use server';
/**
 * @fileOverview Generates a thumbnail image based on a text prompt, incorporating a user-uploaded face if provided.
 *
 * - generateThumbnail - A function that generates a thumbnail image.
 * - GenerateThumbnailInput - The input type for the generateThumbnail function.
 * - GenerateThumbnailOutput - The return type for the generateThumbnail function.
 */

import {ai} from '@/lib/genkit-service';
import {z} from 'genkit';
import wav from 'wav';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateThumbnailInputSchema = z.object({
  prompt: z.string().describe('The prompt to use for generating the thumbnail image.'),
  faceDataUri: z
    .string()
    .optional()
    .describe(
      'An optional photo of a face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type GenerateThumbnailInput = z.infer<typeof GenerateThumbnailInputSchema>;

const GenerateThumbnailOutputSchema = z.object({
  thumbnailDataUri: z
    .string()
    .describe(
      'The generated thumbnail image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type GenerateThumbnailOutput = z.infer<typeof GenerateThumbnailOutputSchema>;

export async function generateThumbnail(input: GenerateThumbnailInput): Promise<GenerateThumbnailOutput> {
  const generateThumbnailFlow = ai.defineFlow(
    {
      name: 'generateThumbnailFlow',
      inputSchema: GenerateThumbnailInputSchema,
      outputSchema: GenerateThumbnailOutputSchema,
    },
    async input => {
      const {
        prompt,
        faceDataUri,
      } = input;
      
      const modelConfig = await getModelConfig('generateThumbnail');

      const mediaInput = faceDataUri ? [{media: {url: faceDataUri}}, {text: prompt}] : prompt;

      const generate = await ai.getGenerator(modelConfig.model);
      const {media} = await generate({
        prompt: mediaInput,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media) {
        throw new Error('No media returned from image generation.');
      }

      return {thumbnailDataUri: media.url};
    }
  );
  return generateThumbnailFlow(input);
}
