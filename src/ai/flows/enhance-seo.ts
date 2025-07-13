'use server';

/**
 * @fileOverview A Genkit flow for analyzing and enhancing YouTube video SEO.
 *
 * - enhanceSeo - A function that analyzes video SEO and provides suggestions.
 * - EnhanceSeoInput - The input type for the enhanceSeo function.
 * - EnhanceSeoOutput - The return type for the enhanceSeo function.
 */

import { ai_defineFlow, ai_generate } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { countries } from '@/lib/countries';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const EnhanceSeoInputSchema = z.object({
  title: z.string().describe('The current title of the YouTube video.'),
  description: z.string().describe('The current description of the YouTube video.'),
  tags: z.array(z.string()).describe('A list of current tags for the video.'),
  region: z.string().describe('The target geographic region for SEO optimization (e.g., US, GB, JP).'),
});
export type EnhanceSeoInput = z.infer<typeof EnhanceSeoInputSchema>;

const EnhanceSeoOutputSchema = z.object({
  initialScore: z.number().min(0).max(100).describe('An SEO score from 0-100 for the original video metadata.'),
  enhancedScore: z.number().min(0).max(100).describe('The projected SEO score after applying the suggestions.'),
  analysis: z.string().describe("A brief analysis of the original SEO's strengths and weaknesses."),
  suggestions: z.object({
    title: z.string().describe('The suggested new video title.'),
    description: z.string().describe('The suggested new video description, including relevant keywords.'),
    tags: z.array(z.string()).describe('A list of suggested new tags.'),
  }),
  reasoning: z.string().describe('An explanation of why the suggested changes will improve SEO, referencing trends and keywords for the target region.'),
  trendsFound: z.boolean().describe('Whether relevant trend data was found and used for the analysis.'),
  trendDataSource: z
    .object({
      text: z.string().describe("A descriptive text for the trend source, e.g., 'Google Trends for United States'"),
      url: z.string().describe("The URL for the trend source, e.g., 'https://trends.google.com/trending?geo=US'"),
    })
    .optional()
    .describe('The source of the trending data used for the analysis. Omitted if no relevant trends were found.'),
});
export type EnhanceSeoOutput = z.infer<typeof EnhanceSeoOutputSchema>;

const EnhanceSeoPromptOutputSchema = EnhanceSeoOutputSchema.omit({ trendDataSource: true });

export async function enhanceSeo(input: EnhanceSeoInput): Promise<EnhanceSeoOutput> {
  const enhanceSeoFlow = await ai_defineFlow(
    {
      name: 'enhanceSeoFlow',
      inputSchema: EnhanceSeoInputSchema,
      outputSchema: EnhanceSeoOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('enhanceSeo'),
        getModelConfig('enhanceSeo')
      ]);

      const template = Handlebars.compile(promptTemplate);
      const filledPrompt = template(input);
      
      const { output: promptOutput } = await ai_generate({
        prompt: filledPrompt,
        model: modelConfig.model,
        output: { schema: EnhanceSeoPromptOutputSchema },
      });
      
      if (!promptOutput) {
        throw new Error('AI failed to generate SEO analysis.');
      }

      const finalOutput: EnhanceSeoOutput = { ...promptOutput };

      if (promptOutput.trendsFound) {
        const country = countries.find((c) => c.code === input.region);
        const countryName = country?.name || 'the selected region';
        finalOutput.trendDataSource = {
          text: `Google Trends for ${countryName}`,
          url: `https://trends.google.com/trending?geo=${input.region}`,
        };
      }
      
      return finalOutput;
    }
  );
  return enhanceSeoFlow(input);
}
