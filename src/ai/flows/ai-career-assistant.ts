'use server';

/**
 * @fileOverview A career advice chatbot flow.
 *
 * - aiCareerAssistant - A function that handles the career advice process.
 * - AiCareerAssistantInput - The input type for the aiCareerAssistant function.
 * - AiCareerAssistantOutput - The return type for the aiCareerAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCareerAssistantInputSchema = z.object({
  query: z.string().describe('The user query for career advice.'),
});
export type AiCareerAssistantInput = z.infer<typeof AiCareerAssistantInputSchema>;

const AiCareerAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the AI career assistant.'),
});
export type AiCareerAssistantOutput = z.infer<typeof AiCareerAssistantOutputSchema>;

export async function aiCareerAssistant(input: AiCareerAssistantInput): Promise<AiCareerAssistantOutput> {
  return aiCareerAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCareerAssistantPrompt',
  input: {schema: AiCareerAssistantInputSchema},
  output: {schema: AiCareerAssistantOutputSchema},
  prompt: `You are an AI Career Coach and Mentor for SkillPilotAI, designed to help users navigate their career journey with personalized advice.

Your expertise includes:
- Resume optimization and personal branding
- Interview preparation and salary negotiation
- Skill gap analysis and upskilling recommendations
- Career path planning and job search strategies
- Industry trends and in-demand skills
- Work-life balance and professional development

Provide thoughtful, actionable advice in a friendly and encouraging tone. Keep responses concise (2-4 paragraphs) unless the user asks for detailed explanations.

User Query: {{{query}}}

Response:`,
});

const aiCareerAssistantFlow = ai.defineFlow(
  {
    name: 'aiCareerAssistantFlow',
    inputSchema: AiCareerAssistantInputSchema,
    outputSchema: AiCareerAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
