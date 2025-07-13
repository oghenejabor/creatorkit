'use server';

/**
 * @fileOverview A Genkit flow for suggesting a catchy overlay text for a YouTube thumbnail.
 *
 * - suggestOverlayText - A function that suggests overlay text based on video title and description.
 * - SuggestOverlayTextInput - The input type for the suggestOverlayText function.
 * - SuggestOverlayTextOutput - The return type for the suggestOverlayText function.
 */

import { ai } from '@/lib/genkit-service';
import { z } from 'genkit';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const SuggestOverlayTextInputSchema = z.object({
  title: z.string().describe('The title of the YouTube video.'),
  description: z.string().describe('The description of the YouTube video.'),
});
export type SuggestOverlayTextInput = z.infer<typeof SuggestOverlayTextInputSchema>;

const SuggestOverlayTextOutputSchema = z.object({
  textOverlay: z.string().describe('A short, catchy text overlay for the thumbnail (2-5 words).'),
});
export type SuggestOverlayTextOutput = z.infer<typeof SuggestOverlayTextOutputSchema>;

export async function suggestOverlayText(input: SuggestOverlayTextInput): Promise<SuggestOverlayTextOutput> {
  const suggestOverlayTextFlow = ai.defineFlow(
    {
      name: 'suggestOverlayTextFlow',
      inputSchema: SuggestOverlayTextInputSchema,
      outputSchema: SuggestOverlayTextOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
          getPrompt('suggestOverlayText'),
          getModelConfig('suggestOverlayText')
      ]);

      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const generate = await ai.getGenerator(modelConfig.model);
      const { output } = await generate({
        prompt: filledPrompt,
        output: { schema: SuggestOverlayTextOutputSchema },
      });
      return output!;
    }
  );
  return suggestOverlayTextFlow(input);
}
