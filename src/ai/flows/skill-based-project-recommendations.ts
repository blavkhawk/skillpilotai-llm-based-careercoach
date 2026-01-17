'use server';
/**
 * @fileOverview Recommends projects based on user skills and career goals.
 *
 * - recommendProjects - A function that recommends projects based on user skills and career goals.
 * - RecommendProjectsInput - The input type for the recommendProjects function.
 * - RecommendProjectsOutput - The return type for the recommendProjects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendProjectsInputSchema = z.object({
  userSkills: z
    .array(z.string())
    .describe('A list of the user\u2019s technical skills.'),
  careerGoals: z.string().describe('The user\u2019s career goals.'),
  portfolioProjects: z
    .array(z.string())
    .optional()
    .describe('A list of the user\u2019s existing portfolio projects.'),
});
export type RecommendProjectsInput = z.infer<typeof RecommendProjectsInputSchema>;

const RecommendProjectsOutputSchema = z.object({
  projects: z.array(
    z.object({
      title: z.string().describe('The title of the project.'),
      description: z.string().describe('A short description of the project.'),
      difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level of the project.'),
      skillsRequired: z.array(z.string()).describe('The skills required to complete the project.'),
      estimatedTime: z.string().describe('The estimated time to complete the project.'),
    })
  ).describe('A list of recommended projects.'),
});
export type RecommendProjectsOutput = z.infer<typeof RecommendProjectsOutputSchema>;

export async function recommendProjects(input: RecommendProjectsInput): Promise<RecommendProjectsOutput> {
  return recommendProjectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendProjectsPrompt',
  input: {
    schema: RecommendProjectsInputSchema,
  },
  output: {
    schema: RecommendProjectsOutputSchema,
  },
  prompt: `You are an expert career coach specializing in helping people build their portfolio.

  You will use this information about the user to recommend projects that align with their skills and career goals.

  Skills: {{#if userSkills}}{{#each userSkills}}- {{{this}}}\n{{/each}}{{else}}None listed{{/if}}
  Career Goals: {{{careerGoals}}}
  Portfolio Projects: {{#if portfolioProjects}}{{#each portfolioProjects}}- {{{this}}}\n{{/each}}{{else}}None listed{{/if}}

  Consider the user's existing portfolio projects and suggest new projects that will help them expand their skillset and showcase their abilities to potential employers.
  The difficulty should be aligned to the user's skills, unless the career goal is to reach a higher skill level, then it can be slightly harder.

  Return the results as a JSON object conforming to this schema:
  ${JSON.stringify(RecommendProjectsOutputSchema.describe, null, 2)}`,
});

const recommendProjectsFlow = ai.defineFlow(
  {
    name: 'recommendProjectsFlow',
    inputSchema: RecommendProjectsInputSchema,
    outputSchema: RecommendProjectsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
