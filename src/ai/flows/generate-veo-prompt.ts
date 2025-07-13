'use server';

/**
 * @fileOverview A Genkit flow for writing detailed Veo prompts.
 *
 * - generateVeoPrompt - A function that generates a detailed text-to-video prompt.
 * - GenerateVeoPromptInput - The input type for the generateVeoPrompt function.
 * - GenerateVeoPromptOutput - The return type for the generateVeoPrompt function.
 */

import { ai_defineFlow, ai_generate } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';
import { VeoPromptCategorySchema } from './veo-prompt-types';

const GenerateVeoPromptInputSchema = z.object({
  category: VeoPromptCategorySchema,
  idea: z.string().describe('A simple idea or concept for the video prompt.'),
  sceneCount: z.number().min(1).max(5).describe('The number of scenes to generate.'),
});
export type GenerateVeoPromptInput = z.infer<typeof GenerateVeoPromptInputSchema>;

const GenerateVeoPromptOutputSchema = z.object({
  veoPrompt: z.string().describe('The detailed, high-quality prompt ready to be used with a video generation model like Veo.'),
});
export type GenerateVeoPromptOutput = z.infer<typeof GenerateVeoPromptOutputSchema>;

export async function generateVeoPrompt(input: GenerateVeoPromptInput): Promise<GenerateVeoPromptOutput> {
  const generateVeoPromptFlow = await ai_defineFlow(
    {
      name: 'generateVeoPromptFlow',
      inputSchema: GenerateVeoPromptInputSchema,
      outputSchema: GenerateVeoPromptOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateVeoPrompt'),
        getModelConfig('generateVeoPrompt'),
      ]);
      
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const { output } = await ai_generate({
        prompt: filledPrompt,
        model: modelConfig.model,
        output: { schema: GenerateVeoPromptOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate a Veo prompt.');
      }
      
      return output;
    }
  );
  return generateVeoPromptFlow(input);
}
