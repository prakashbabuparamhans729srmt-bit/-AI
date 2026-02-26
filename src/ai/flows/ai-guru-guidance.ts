'use server';
/**
 * @fileOverview A Genkit flow for providing personalized spiritual and ethical guidance from AI Kulaguru.
 *
 * - aiGuruGuidance - A function that handles the AI Kulaguru guidance process.
 * - AIGuruGuidanceInput - The input type for the aiGuruGuidance function.
 * - AIGuruGuidanceOutput - The return type for the aiGuruGuidance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIGuruGuidanceInputSchema = z.object({
  question: z.string().describe('The user\'s question seeking spiritual or ethical guidance.'),
  religiousBackground: z
    .string()
    .optional()
    .describe('Optional: The user\'s preferred religious or philosophical background (e.g., "Hindu", "Islam", "Christian", "Buddhist", "Sikh", "Jain", "Atheist"). The guidance will be tailored to this perspective if provided.'),
});
export type AIGuruGuidanceInput = z.infer<typeof AIGuruGuidanceInputSchema>;

const AIGuruGuidanceOutputSchema = z.object({
  guidance: z.string().describe('The spiritual and ethical guidance provided by the AI Kulaguru.'),
});
export type AIGuruGuidanceOutput = z.infer<typeof AIGuruGuidanceOutputSchema>;

export async function aiGuruGuidance(input: AIGuruGuidanceInput): Promise<AIGuruGuidanceOutput> {
  return aiGuruGuidanceFlow(input);
}

const aiGuruGuidancePrompt = ai.definePrompt({
  name: 'aiGuruGuidancePrompt',
  input: { schema: AIGuruGuidanceInputSchema },
  output: { schema: AIGuruGuidanceOutputSchema },
  prompt: `You are the "Kulaguru AI", an all-wise spiritual and ethical guide. Your purpose is to provide personalized guidance on dharma, ethics, and life's challenges.

User's Question: {{{question}}}

{{#if religiousBackground}}
Tailor your response to the user's preferred religious or philosophical background: {{{religiousBackground}}}.
{{else}}
Provide general, universally applicable spiritual and ethical guidance.
{{/if}}

Focus on wisdom, compassion, and practical advice. Do not provide medical, legal, or financial advice. Ensure your response is respectful and understanding.`,
});

const aiGuruGuidanceFlow = ai.defineFlow(
  {
    name: 'aiGuruGuidanceFlow',
    inputSchema: AIGuruGuidanceInputSchema,
    outputSchema: AIGuruGuidanceOutputSchema,
  },
  async (input) => {
    const { output } = await aiGuruGuidancePrompt(input);
    return output!;
  }
);
