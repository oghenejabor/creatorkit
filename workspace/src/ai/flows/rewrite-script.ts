'use server';

/**
 * @fileOverview A Genkit flow for analyzing and rewriting a YouTube script based on a competitor's script.
 *
 * - rewriteScript - A function that analyzes and rewrites a script.
 * - RewriteScriptInput - The input type for the rewriteScript function.
 * - RewriteScriptOutput - The return type for the rewriteScript function.
 */

import { ai } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const RewriteScriptInputSchema = z.object({
  competitorScript: z.string().describe("The script of the competitor's YouTube video."),
  userScript: z.string().describe('The user-provided script to be rewritten.'),
});
export type RewriteScriptInput = z.infer<typeof RewriteScriptInputSchema>;

const RewriteScriptOutputSchema = z.object({
  competitorScriptAnalysis: z
    .string()
    .describe("Analysis of the competitor's script strengths (hook, pacing, etc.)."),
  userScriptAnalysis: z
    .string()
    .describe("Constructive criticism of the user's script's weaknesses."),
  suggestedScript: z.string().describe('The rewritten, improved script.'),
  reasoning: z
    .string()
    .describe('A clear explanation for why the rewritten script is better.'),
});
export type RewriteScriptOutput = z.infer<typeof RewriteScriptOutputSchema>;

export async function rewriteScript(input: RewriteScriptInput): Promise<RewriteScriptOutput> {
  const rewriteScriptFlow = ai.defineFlow(
    {
      name: 'rewriteScriptFlow',
      inputSchema: RewriteScriptInputSchema,
      outputSchema: RewriteScriptOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
          getPrompt('rewriteScript'),
          getModelConfig('rewriteScript')
      ]);

      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);

      const generate = await ai.getGenerator(modelConfig.model);
      const { output } = await generate({
        prompt: filledPrompt,
        output: { schema: RewriteScriptOutputSchema },
      });


      if (!output) {
        throw new Error('AI failed to generate script analysis.');
      }
      
      return output;
    }
  );
  return rewriteScriptFlow(input);
}
