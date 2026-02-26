'use server';
/**
 * @fileOverview A Genkit flow for comparing religious or ethical concepts across different faiths.
 *
 * - compareInterfaithConcept - A function that handles the interfaith concept comparison process.
 * - InterfaithConceptComparisonInput - The input type for the compareInterfaithConcept function.
 * - InterfaithConceptComparisonOutput - The return type for the compareInterfaithConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterfaithConceptComparisonInputSchema = z.object({
  concept: z
    .string()
    .describe(
      'The religious or ethical concept to compare (e.g., "concept of sin", "afterlife").'
    ),
});
export type InterfaithConceptComparisonInput = z.infer<
  typeof InterfaithConceptComparisonInputSchema
>;

const InterfaithConceptComparisonOutputSchema = z.object({
  concept: z.string().describe('The religious or ethical concept that was compared.'),
  comparisons: z
    .array(
      z.object({
        faith: z.string().describe('The name of the faith (e.g., "Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Judaism").'),
        perspective: z
          .string()
          .describe('A concise explanation of the concept from the perspective of this faith.'),
      })
    )
    .describe('An array of comparisons, each detailing the perspective of a different faith.'),
});
export type InterfaithConceptComparisonOutput = z.infer<
  typeof InterfaithConceptComparisonOutputSchema
>;

export async function compareInterfaithConcept(
  input: InterfaithConceptComparisonInput
): Promise<InterfaithConceptComparisonOutput> {
  return interfaithConceptComparisonFlow(input);
}

const interfaithConceptComparisonPrompt = ai.definePrompt({
  name: 'interfaithConceptComparisonPrompt',
  input: {schema: InterfaithConceptComparisonInputSchema},
  output: {schema: InterfaithConceptComparisonOutputSchema},
  prompt: `You are an expert on world religions and ethical philosophies.
Given a religious or ethical concept, provide a concise comparative analysis of how this concept is understood and interpreted across various major faiths, including Hinduism, Islam, Christianity, Sikhism, Buddhism, and Judaism.

Focus on the core aspects and main differences or similarities without going into excessive detail.

The concept to analyze is: {{{concept}}}`,
});

const interfaithConceptComparisonFlow = ai.defineFlow(
  {
    name: 'interfaithConceptComparisonFlow',
    inputSchema: InterfaithConceptComparisonInputSchema,
    outputSchema: InterfaithConceptComparisonOutputSchema,
  },
  async (input) => {
    const {output} = await interfaithConceptComparisonPrompt(input);
    return output!;
  }
);
