'use server';

/**
 * @fileOverview A Genkit flow for generating a Privacy Policy and Terms & Conditions for a mobile app.
 *
 * - generatePrivacyPolicy - A function that generates the legal documents.
 * - savePolicyAndGetId - A function that saves the documents and returns a unique ID.
 * - GeneratePrivacyPolicyInput - The input type for the function.
 * - GeneratePrivacyPolicyOutput - The return type for the function.
 */

import { ai_defineFlow, ai_generate } from '@/lib/genkit-service';
import { z } from 'zod';
import Handlebars from 'handlebars';
import { getPrompt } from '@/lib/prompt-service';
import { getModelConfig } from '@/lib/model-config-service';

const thirdPartyLinks: Record<string, { policy: string, terms: string }> = {
    'Google Play Services': { policy: 'https://policies.google.com/privacy', terms: 'https://policies.google.com/terms' },
    'AdMob': { policy: 'https://support.google.com/admob/answer/6128543', terms: 'https://developers.google.com/admob/android/terms' },
    'Google Analytics for Firebase': { policy: 'https://firebase.google.com/policies/analytics', terms: 'https://firebase.google.com/terms/analytics' },
    'Firebase Crashlytics': { policy: 'https://firebase.google.com/support/privacy/', terms: 'https://firebase.google.com/terms/crashlytics' },
    'Facebook': { policy: 'https://www.facebook.com/about/privacy', terms: 'https://www.facebook.com/legal/terms' },
    'Fabric': { policy: 'https://firebase.google.com/support/privacy/', terms: 'https://firebase.google.com/terms/crashlytics' },
    'Matomo': { policy: 'https://matomo.org/privacy-policy/', terms: 'https://matomo.org/terms/' },
    'Clicky': { policy: 'https://clicky.com/terms/privacy', terms: 'https://clicky.com/terms' },
    'Flurry Analytics': { policy: 'https://www.verizonmedia.com/policies/us/en/verizonmedia/privacy/index.html', terms: 'https://developer.yahoo.com/flurry/legal-terms/flurry-analytics-terms-service.html' },
    'Appodeal': { policy: 'https://www.appodeal.com/privacy-policy/', terms: 'https://www.appodeal.com/terms-of-service/' },
    'Fathom Analytics': { policy: 'https://usefathom.com/privacy', terms: 'https://usefathom.com/terms' },
    'Unity': { policy: 'https://unity3d.com/legal/privacy-policy', terms: 'https://unity3d.com/legal/terms-of-service' },
    'SDKBOX': { policy: 'https://www.sdkbox.com/privacy', terms: 'https://www.sdkbox.com/tos' },
    'GameAnalytics': { policy: 'https://gameanalytics.com/privacy', terms: 'https://gameanalytics.com/terms' },
    'One Signal': { policy: 'https://onesignal.com/privacy_policy', terms: 'https://onesignal.com/tos' },
    'Expo': { policy: 'https://expo.dev/privacy', terms: 'https://expo.dev/terms' },
    'Sentry': { policy: 'https://sentry.io/privacy/', terms: 'https://sentry.io/terms/' },
    'AppLovin': { policy: 'https://www.applovin.com/privacy/', terms: 'https://www.applovin.com/terms/' },
    'Vungle': { policy: 'https://liftoff.io/privacy-policy/', terms: 'https://liftoff.io/terms-of-service/' },
    'StartApp': { policy: 'https://www.start.io/policy/privacy-policy/', terms: 'https://www.start.io/policy/publisher-terms-and-conditions/' },
    'AdColony': { policy: 'https://www.adcolony.com/privacy-policy/', terms: 'https://www.adcolony.com/publisher-terms-and-conditions/' },
    'Amplitude': { policy: 'https://amplitude.com/privacy', terms: 'https://amplitude.com/terms' },
    'Adjust': { policy: 'https://www.adjust.com/terms/privacy-policy/', terms: 'https://www.adjust.com/terms/general-terms-and-conditions/' },
    'Mapbox': { policy: 'https://www.mapbox.com/legal/privacy', terms: 'https://www.mapbox.com/legal/tos' },
    'Godot': { policy: 'https://godotengine.org/privacy-policy/', terms: 'https://godotengine.org/license/' },
    'Segment': { policy: 'https://segment.com/legal/privacy/', terms: 'https://segment.com/legal/terms/' },
    'Mixpanel': { policy: 'https://mixpanel.com/legal/privacy-policy/', terms: 'https://mixpanel.com/legal/terms-of-use/' },
    'RevenueCat': { policy: 'https://www.revenuecat.com/privacy', terms: 'https://www.revenuecat.com/terms' },
    'Clerk': { policy: 'https://clerk.com/privacy', terms: 'https://clerk.com/terms' },
    'Adapty': { policy: 'https://adapty.io/privacy', terms: 'https://adapty.io/terms' },
    'ConfigCat': { policy: 'https://configcat.com/privacy-policy/', terms: 'https://configcat.com/terms-of-service/' },
    'Instabug': { policy: 'https://instabug.com/privacy', terms: 'https://instabug.com/terms' },
};

const GeneratePrivacyPolicyInputSchema = z.object({
  appName: z.string().describe('The name of the application.'),
  contactEmail: z.string().email().describe('The contact email for privacy inquiries.'),
  effectiveDate: z.string().describe('The effective date of the policy in DD/MM/YYYY format.'),
  pii: z.array(z.string()).describe('List of personally identifiable information collected.'),
  appType: z.enum(['Free', 'Open Source', 'Freemium', 'Ad Supported', 'Commercial']).describe('The type of the app.'),
  mobileOS: z.array(z.string()).describe('The mobile operating systems the app supports.'),
  ownerType: z.enum(['Individual', 'Company']).describe('The type of the app owner.'),
  developerName: z.string().describe('The name of the individual developer or company.'),
  thirdPartyServices: z.array(z.string()).optional().describe('List of third-party services used.'),
});
export type GeneratePrivacyPolicyInput = z.infer<typeof GeneratePrivacyPolicyInputSchema>;

const GeneratePrivacyPolicyOutputSchema = z.object({
  privacyPolicy: z.string().describe('The full text of the generated privacy policy.'),
  termsAndConditions: z.string().describe('The full text of the generated terms and conditions.'),
});
export type GeneratePrivacyPolicyOutput = z.infer<typeof GeneratePrivacyPolicyOutputSchema>;


export async function generatePrivacyPolicy(input: GeneratePrivacyPolicyInput): Promise<GeneratePrivacyPolicyOutput> {
  const generatePrivacyPolicyFlow = await ai_defineFlow(
    {
      name: 'generatePrivacyPolicyFlow',
      inputSchema: GeneratePrivacyPolicyInputSchema,
      outputSchema: GeneratePrivacyPolicyOutputSchema,
    },
    async (input) => {
      const [promptTemplate, modelConfig] = await Promise.all([
        getPrompt('generatePrivacyPolicy'),
        getModelConfig('generatePrivacyPolicy'),
      ]);

      const finalInput = {
        ...input,
        thirdPartyServices: input.thirdPartyServices || [],
      };

      const serviceDetails = finalInput.thirdPartyServices.map(service => ({
          name: service,
          ...thirdPartyLinks[service]
      }));

      const filledPrompt = Handlebars.compile(promptTemplate)({
          ...finalInput,
          thirdPartyServiceDetails: serviceDetails
      });

      const { output } = await ai_generate({
        prompt: filledPrompt,
        model: modelConfig.model,
        output: { schema: GeneratePrivacyPolicyOutputSchema },
      });
      
      if (!output) {
        throw new Error('AI failed to generate privacy policy content.');
      }
      
      return output;
    }
  );
  return generatePrivacyPolicyFlow(input);
}
