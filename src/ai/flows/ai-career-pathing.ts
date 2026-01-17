// src/ai/flows/ai-career-pathing.ts
'use server';

/**
 * @fileOverview Generates a personalized career path with course recommendations based on user input.
 *
 * - generateCareerPath - A function that generates a personalized career path.
 * - CareerPathInput - The input type for the generateCareerPath function.
 * - CareerPathOutput - The return type for the generateCareerPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerPathInputSchema = z.object({
  skills: z.string().describe('List of skills the user possesses.'),
  experience: z.string().describe('Description of the user\u2019s work experience.'),
  careerGoals: z.string().describe('The user\u2019s desired career goals.'),
});
export type CareerPathInput = z.infer<typeof CareerPathInputSchema>;

const CareerPathOutputSchema = z.object({
  careerPath: z.string().describe('A detailed career path tailored to the user.'),
  courseRecommendations: z.string().describe('Specific course and learning recommendations.'),
});
export type CareerPathOutput = z.infer<typeof CareerPathOutputSchema>;

export async function generateCareerPath(input: CareerPathInput): Promise<CareerPathOutput> {
  return careerPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerPathPrompt',
  input: {schema: CareerPathInputSchema},
  output: {schema: CareerPathOutputSchema},
  prompt: `You are an AI career coach. Generate a personalized career path with specific course and learning recommendations based on the user's provided skills, experience, and career goals.

Skills: {{{skills}}}
Experience: {{{experience}}}
Career Goals: {{{careerGoals}}}

Career Path: 
Course Recommendations: `,
});

const careerPathFlow = ai.defineFlow(
  {
    name: 'careerPathFlow',
    inputSchema: CareerPathInputSchema,
    outputSchema: CareerPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
