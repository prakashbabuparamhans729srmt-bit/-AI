'use server';
/**
 * @fileOverview A Genkit flow for a support chatbot that answers questions about the app.
 *
 * - supportChat - A function that handles the support chat process.
 * - SupportChatInput - The input type for the supportChat function.
 * - SupportChatOutput - The return type for the supportChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SupportChatInputSchema = z.object({
  question: z.string().describe("The user's question about the app."),
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const SupportChatOutputSchema = z.object({
  answer: z.string().describe('A helpful answer to the user\'s question.'),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
  return supportChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'supportChatPrompt',
  input: { schema: SupportChatInputSchema },
  output: { schema: SupportChatOutputSchema },
  prompt: `You are a friendly and helpful support chatbot for an app called "कुलगुरु AI".
Your purpose is to answer user questions about how to use the app.
The app has the following features:
- Dashboard: Personalized daily wisdom, quick services, chat with AI guru, family members, goals, and progress tracker.
- Knowledge Hub: Search and compare concepts across different religions.
- Rules Code: A chart explaining different types of laws (natural, social, spiritual).
- Crisis Counseling: AI and human support for personal crises.
- Kids' Corner: Stories and activities for children.
- Community Forum: Discuss topics with other users.
- Profile: Manage user and family profiles, set goals.
- Guru Training: Information about becoming a certified guru.
- Settings: Change app theme.

Answer the user's question clearly and concisely in Hindi.

User's Question: {{{question}}}
`,
});

const supportChatFlow = ai.defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
