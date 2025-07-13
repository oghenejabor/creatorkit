'use server';

/**
 * @fileOverview A Genkit flow for generating short-form TikTok voiceover text.
 *
 * - generateTiktokVoiceover - Generates a TikTok voiceover.
 * - GenerateTiktokVoiceoverInput - The input type for this function.
 * - GenerateTiktokVoiceoverOutput - The return type for this function.
 */

import { ai_defineFlow, ai_generate } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateTiktokVoiceoverInputSchema = z.object({
  topic: z.string().describe('The topic, goal, or idea for the video.'),
  style: z.string().optional().describe('Optional: A desired style for the voiceover (e.g., energetic, calm, funny).'),
});
export type GenerateTiktokVoiceoverInput = z.infer<typeof GenerateTiktokVoiceoverInputSchema>;

const GenerateTiktokVoiceoverOutputSchema = z.object({
  voiceover: z.string().describe('A concise voiceover text (max 150 words) suitable for a short-form video.'),
});
export type GenerateTiktokVoiceoverOutput = z.infer<typeof GenerateTiktokVoiceoverOutputSchema>;

export async function generateTiktokVoiceover(input: GenerateTiktokVoiceoverInput): Promise<GenerateTiktokVoiceoverOutput> {
  const generateTiktokVoiceoverFlow = await ai_defineFlow(
    {
      name: 'generateTiktokVoiceoverFlow',
      inputSchema: GenerateTiktokVoiceoverInputSchema,
      outputSchema: GenerateTiktokVoiceoverOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateTiktokVoiceover'),
        getModelConfig('generateTiktokVoiceover'),
      ]);
      
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const { output } = await ai_generate({
        prompt: filledPrompt,
        model: modelConfig.model,
        output: { schema: GenerateTiktokVoiceoverOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate a TikTok voiceover.');
      }
      
      return output;
    }
  );
  return generateTiktokVoiceoverFlow(input);
}
