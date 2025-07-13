'use server';

/**
 * @fileOverview A Genkit flow for generating short-form TikTok video scripts.
 *
 * - generateTiktokScript - Generates a TikTok script.
 * - GenerateTiktokScriptInput - The input type for this function.
 * - GenerateTiktokScriptOutput - The return type for this function.
 */

import { ai } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateTiktokScriptInputSchema = z.object({
  topic: z.string().describe('The topic, goal, or idea for the video.'),
  voiceoverStyle: z.string().optional().describe('Optional: A desired style for the voiceover (e.g., energetic, calm, funny).'),
});
export type GenerateTiktokScriptInput = z.infer<typeof GenerateTiktokScriptInputSchema>;

const GenerateTiktokScriptOutputSchema = z.object({
  script: z.string().describe('A full short-form script (60 seconds max) with emotional structure, visual cues, and voiceover suggestions.'),
});
export type GenerateTiktokScriptOutput = z.infer<typeof GenerateTiktokScriptOutputSchema>;

export async function generateTiktokScript(input: GenerateTiktokScriptInput): Promise<GenerateTiktokScriptOutput> {
  const generateTiktokScriptFlow = ai.defineFlow(
    {
      name: 'generateTiktokScriptFlow',
      inputSchema: GenerateTiktokScriptInputSchema,
      outputSchema: GenerateTiktokScriptOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateTiktokScript'),
        getModelConfig('generateTiktokScript'),
      ]);
      
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const generate = await ai.getGenerator(modelConfig.model);
      const { output } = await generate({
        prompt: filledPrompt,
        output: { schema: GenerateTiktokScriptOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate a TikTok script.');
      }
      
      return output;
    }
  );
  return generateTiktokScriptFlow(input);
}
