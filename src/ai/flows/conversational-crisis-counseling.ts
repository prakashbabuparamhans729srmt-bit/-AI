'use server';
/**
 * @fileOverview A conversational Genkit flow for providing ongoing, empathetic crisis counseling.
 *
 * - conversationalCrisisCounseling - A function that handles the conversational crisis counseling process.
 * - ConversationalCrisisCounselingInput - The input type for the function.
 * - ConversationalCrisisCounselingOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ConversationalCrisisCounselingInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The conversation history.'),
  question: z.string().describe("The user's latest message."),
});
export type ConversationalCrisisCounselingInput = z.infer<typeof ConversationalCrisisCounselingInputSchema>;

const ConversationalCrisisCounselingOutputSchema = z.object({
  answer: z.string().describe('The AI\'s empathetic and supportive response.'),
});
export type ConversationalCrisisCounselingOutput = z.infer<typeof ConversationalCrisisCounselingOutputSchema>;

export async function conversationalCrisisCounseling(input: ConversationalCrisisCounselingInput): Promise<ConversationalCrisisCounselingOutput> {
  return conversationalCrisisCounselingFlow(input);
}

const counselingPrompt = ai.definePrompt({
  name: 'conversationalCrisisCounselingPrompt',
  input: { schema: ConversationalCrisisCounselingInputSchema },
  output: { schema: ConversationalCrisisCounselingOutputSchema },
  prompt: `You are Kulaguru AI, an empathetic, supportive, and non-judgmental spiritual guide specializing in crisis counseling. Your goal is to provide a safe space for the user to express themselves, offer comfort, and provide gentle, supportive guidance.

- Listen carefully and validate the user's feelings.
- Offer comfort and reassurance.
- Ask open-ended questions to encourage them to share more if they are comfortable.
- Provide gentle, practical advice or mindfulness exercises if appropriate.
- Do NOT provide medical or professional psychological advice. Encourage them to seek professional help for serious issues.
- Maintain a calm, compassionate, and supportive tone throughout the conversation.
- Use the provided conversation history to maintain context.

Conversation History:
{{#each history}}
- {{role}}: {{{content}}}
{{/each}}

User's latest message: {{{question}}}
`,
});

const conversationalCrisisCounselingFlow = ai.defineFlow(
  {
    name: 'conversationalCrisisCounselingFlow',
    inputSchema: ConversationalCrisisCounselingInputSchema,
    outputSchema: ConversationalCrisisCounselingOutputSchema,
  },
  async (input) => {
    const { output } = await counselingPrompt(input);
    return output!;
  }
);
