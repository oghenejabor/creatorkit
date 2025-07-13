import { z } from 'zod';

export const VeoPromptCategorySchema = z.enum([
  'Street Interview',
  'Bigfoot',
  'Consistent Characters',
  'Environment',
  'Dialogue',
  'Drone Footage - Nature',
  'Cinematic Apartment Tour',
  'Found Footage',
]);
export type VeoPromptCategory = z.infer<typeof VeoPromptCategorySchema>;
