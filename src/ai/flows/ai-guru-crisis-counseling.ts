'use server';
/**
 * @fileOverview This file implements a Genkit flow for providing empathetic spiritual comfort and guidance
 * in times of personal crisis, aligning with chosen faith traditions.
 *
 * - crisisCounseling - A function that handles the crisis counseling process.
 * - CrisisCounselingInput - The input type for the crisisCounseling function.
 * - CrisisCounselingOutput - The return type for the crisisCounseling function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrisisTypeSchema = z.enum([
  'Family discord',
  'Financial stress',
  'Grief of death',
  'Anger issues',
  'Fear/Anxiety',
  'Loneliness',
  'Addiction',
  'Marital problems',
  'Elderly care',
]);

const ReligiousPreferenceSchema = z.enum([
  'Hindu',
  'Islam',
  'Christian',
  'Sikh',
  'Buddhist',
  'Jewish',
  'Interfaith/Universal Spiritual Principles',
]);

const CrisisCounselingInputSchema = z.object({
  crisisType: CrisisTypeSchema.describe('The type of personal crisis the user is experiencing.').openapi({
    examples: ['Grief of death', 'Fear/Anxiety'],
  }),
  religiousPreference: ReligiousPreferenceSchema.optional().describe(
    'An optional religious preference to tailor the guidance. If not provided, universal spiritual principles will be used.'
  ).openapi({
    examples: ['Hindu', 'Islam']
  }),
});
export type CrisisCounselingInput = z.infer<typeof CrisisCounselingInputSchema>;

const CrisisCounselingOutputSchema = z.object({
  message: z
    .string()
    .describe('An empathetic message of comfort and understanding.'),
  relevantTeachings: z
    .string()
    .describe(
      'Specific spiritual teachings, scriptures, or philosophical viewpoints relevant to the crisis and chosen faith.'
    ),
  practicalSteps: z
    .array(z.string())
    .describe('Actionable steps or practices for finding solace and support.'),
});
export type CrisisCounselingOutput = z.infer<typeof CrisisCounselingOutputSchema>;

export async function crisisCounseling(input: CrisisCounselingInput): Promise<CrisisCounselingOutput> {
  return aiCrisisCounselingFlow(input);
}

const crisisCounselingPrompt = ai.definePrompt({
  name: 'crisisCounselingPrompt',
  input: {schema: CrisisCounselingInputSchema},
  output: {schema: CrisisCounselingOutputSchema},
  prompt: `You are Kulaguru AI, an empathetic spiritual guide providing comfort and wisdom.

A user is experiencing a personal crisis. Your role is to provide compassionate guidance, relevant spiritual teachings, and practical steps for finding solace and support.

User's Crisis: {{{crisisType}}}
{{#if religiousPreference}}
User's Religious Preference: {{{religiousPreference}}}
{{else}}
The user has not specified a religious preference. Provide general spiritual guidance that is inclusive and promotes universal values, avoiding specific religious dogma unless explicitly asked.
{{/if}}

Focus on providing comfort, explaining relevant spiritual perspectives, and offering concrete, gentle actions the user can take.
`,
});

const aiCrisisCounselingFlow = ai.defineFlow(
  {
    name: 'aiCrisisCounselingFlow',
    inputSchema: CrisisCounselingInputSchema,
    outputSchema: CrisisCounselingOutputSchema,
  },
  async (input) => {
    const {output} = await crisisCounselingPrompt(input);
    return output!;
  }
);
