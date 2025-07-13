'use server';

/**
 * @fileOverview A Genkit flow for generating viral TikTok video ideas.
 *
 * - generateTiktokVideoIdea - Generates TikTok video ideas.
 * - GenerateTiktokVideoIdeaInput - The input type for this function.
 * - GenerateTiktokVideoIdeaOutput - The return type for this function.
 */

import { ai } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const GenerateTiktokVideoIdeaInputSchema = z.object({
  niche: z.string().describe("The creator's niche or area of interest."),
});
export type GenerateTiktokVideoIdeaInput = z.infer<typeof GenerateTiktokVideoIdeaInputSchema>;

const VideoIdeaSchema = z.object({
    idea: z.string().describe("The core concept of the video idea."),
    hook: z.string().describe("A catchy hook for the video's beginning."),
    trendNotes: z.string().describe("Notes on any relevant trends, sounds, or effects to use."),
});

const GenerateTiktokVideoIdeaOutputSchema = z.object({
  ideas: z.array(VideoIdeaSchema).describe('A list of 10 viral TikTok video ideas with hooks, effects, and trend notes.'),
});
export type GenerateTiktokVideoIdeaOutput = z.infer<typeof GenerateTiktokVideoIdeaOutputSchema>;

export async function generateTiktokVideoIdea(input: GenerateTiktokVideoIdeaInput): Promise<GenerateTiktokVideoIdeaOutput> {
  const generateTiktokVideoIdeaFlow = ai.defineFlow(
    {
      name: 'generateTiktokVideoIdeaFlow',
      inputSchema: GenerateTiktokVideoIdeaInputSchema,
      outputSchema: GenerateTiktokVideoIdeaOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generateTiktokVideoIdea'),
        getModelConfig('generateTiktokVideoIdea'),
      ]);
      
      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const generate = await ai.getGenerator(modelConfig.model);
      const { output } = await generate({
        prompt: filledPrompt,
        output: { schema: GenerateTiktokVideoIdeaOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate TikTok video ideas.');
      }
      
      return output;
    }
  );
  return generateTiktokVideoIdeaFlow(input);
}
