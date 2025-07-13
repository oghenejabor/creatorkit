'use server';

/**
 * @fileOverview A Genkit flow for generating TikTok calls-to-action (CTAs).
 *
 * - generateTiktokCta - Generates creative CTAs.
 * - GenerateTiktokCtaInput - The input type for this function.
 * - GenerateTiktokCtaOutput - The return type for this function.
 */

import { ai } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateTiktokCtaInputSchema = z.object({
  goal: z.string().describe('The goal of the CTA (e.g., get follows, drive traffic, increase engagement).'),
});
export type GenerateTiktokCtaInput = z.infer<typeof GenerateTiktokCtaInputSchema>;

const GenerateTiktokCtaOutputSchema = z.object({
  ctas: z.array(z.string()).describe('A list of 5-10 creative call-to-action phrases.'),
});
export type GenerateTiktokCtaOutput = z.infer<typeof GenerateTiktokCtaOutputSchema>;

export async function generateTiktokCta(input: GenerateTiktokCtaInput): Promise<GenerateTiktokCtaOutput> {
  const generateTiktokCtaFlow = ai.defineFlow(
    {
      name: 'generateTiktokCtaFlow',
      inputSchema: GenerateTiktokCtaInputSchema,
      outputSchema: GenerateTiktokCtaOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateTiktokCta'),
        getModelConfig('generateTiktokCta'),
      ]);
      
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const generate = await ai.getGenerator(modelConfig.model);
      const { output } = await generate({
        prompt: filledPrompt,
        output: { schema: GenerateTiktokCtaOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate TikTok CTAs.');
      }
      
      return output;
    }
  );
  return generateTiktokCtaFlow(input);
}
