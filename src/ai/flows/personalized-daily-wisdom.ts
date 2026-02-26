'use server';
/**
 * @fileOverview A Genkit flow for generating personalized daily wisdom.
 *
 * - personalizedDailyWisdom - A function that generates daily wisdom based on family profiles and spiritual preferences.
 * - PersonalizedDailyWisdomInput - The input type for the personalizedDailyWisdom function.
 * - PersonalizedDailyWisdomOutput - The return type for the personalizedDailyWisdom function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FamilyMemberSchema = z.object({
  name: z.string().describe('The name of the family member.'),
  age: z.number().describe('The age of the family member.'),
  spiritualInterests: z.string().optional().describe('Spiritual interests of the family member.'),
});

const PersonalizedDailyWisdomInputSchema = z.object({
  familyMembers: z.array(FamilyMemberSchema).describe('An array of family members with their details.'),
  familySpiritualPreference: z.string().describe('The overarching spiritual or religious preference of the family.'),
  currentDate: z.string().describe('The current date, e.g., "Tuesday, 15 April 2025".'),
});
export type PersonalizedDailyWisdomInput = z.infer<typeof PersonalizedDailyWisdomInputSchema>;

const ChildrenStorySchema = z.object({
  title: z.string().describe('The title of the story.'),
  story: z.string().describe('A short, age-appropriate story or summary.'),
  ageGroup: z.string().describe('The age group for which the story is suitable (e.g., "3-5 years", "6-8 years").'),
});

const PersonalizedDailyWisdomOutputSchema = z.object({
  dailyThought: z.string().describe('A personalized daily thought or spiritual affirmation.'),
  childrenStories: z.array(ChildrenStorySchema).optional().describe('A list of age-appropriate stories for children, if present in the family.'),
  familyActivities: z.array(z.string()).describe('Suggested spiritual or family bonding activities.'),
});
export type PersonalizedDailyWisdomOutput = z.infer<typeof PersonalizedDailyWisdomOutputSchema>;

export async function personalizedDailyWisdom(input: PersonalizedDailyWisdomInput): Promise<PersonalizedDailyWisdomOutput> {
  return personalizedDailyWisdomFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedDailyWisdomPrompt',
  input: { schema: PersonalizedDailyWisdomInputSchema },
  output: { schema: PersonalizedDailyWisdomOutputSchema },
  prompt: `You are a compassionate and wise AI Kulaguru, providing spiritual and ethical guidance to families in India.
Today is {{{currentDate}}}.

The family's primary spiritual preference is {{{familySpiritualPreference}}}. Tailor your responses to resonate with this preference, but also embrace universal spiritual values.

Here are the family members:
{{#each familyMembers}}
- Name: {{{name}}}, Age: {{{age}}} {{#if spiritualInterests}} (Interests: {{{spiritualInterests}}}){{/if}}
{{/each}}

Based on the family's profile and spiritual preferences, generate the following:
1.  **A Daily Thought/Spiritual Affirmation**: A concise and uplifting thought for the day.
2.  **Children's Stories**: If there are children in the family, provide 1-2 short, age-appropriate moral or spiritual stories. Indicate the target age group for each story.
3.  **Family Activities**: Suggest 1-2 family spiritual or bonding activities that align with their preferences.

Ensure the tone is respectful, encouraging, and culturally sensitive.

Output the result in a JSON object conforming to the PersonalizedDailyWisdomOutputSchema.`,
});

const personalizedDailyWisdomFlow = ai.defineFlow(
  {
    name: 'personalizedDailyWisdomFlow',
    inputSchema: PersonalizedDailyWisdomInputSchema,
    outputSchema: PersonalizedDailyWisdomOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
