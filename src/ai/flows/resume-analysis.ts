'use server';

/**
 * @fileOverview Resume analysis flow with skill scoring
 *
 * - analyzeResume - Analyzes resume text and returns structured skill scores
 * - ResumeAnalysisInput - Input schema with resume text and user info
 * - ResumeAnalysisOutput - Output schema with skill scores and insights
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeAnalysisInputSchema = z.object({
  resumeText: z.string().describe('The extracted text from the resume'),
  userName: z.string().optional().describe('User name'),
  jobField: z.string().optional().describe('Field of interest (e.g., Data Science, Frontend Development)'),
  skills: z.string().optional().describe('Self-declared skills (comma-separated)'),
});
export type ResumeAnalysisInput = z.infer<typeof ResumeAnalysisInputSchema>;

const ResumeAnalysisOutputSchema = z.object({
  overall_skill_index: z.number().min(0).max(100).describe('Overall skill score from 0-100'),
  category_scores: z.object({
    Frontend: z.number().min(0).max(100),
    Backend: z.number().min(0).max(100),
    'AI/ML': z.number().min(0).max(100),
    Design: z.number().min(0).max(100),
    DevOps: z.number().min(0).max(100),
  }).describe('Skill scores by category'),
  strengths: z.array(z.string()).describe('List of key strengths'),
  weaknesses: z.array(z.string()).describe('Areas for improvement'),
  summary: z.string().describe('One-sentence profile summary'),
});
export type ResumeAnalysisOutput = z.infer<typeof ResumeAnalysisOutputSchema>;

export async function analyzeResume(input: ResumeAnalysisInput): Promise<ResumeAnalysisOutput> {
  return resumeAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeAnalysisPrompt',
  input: {schema: ResumeAnalysisInputSchema},
  output: {schema: ResumeAnalysisOutputSchema},
  prompt: `You are an AI career coach analyzing a candidate's résumé.

Candidate Info:
Name: {{{userName}}}
Field of Interest: {{{jobField}}}
Self-Declared Skills: {{{skills}}}

Resume Text:
{{{resumeText}}}

Analyze this candidate's résumé and provide a structured assessment:

1. Calculate an overall_skill_index (0-100) based on their experience, skills, and achievements
2. Score them across 5 categories (Frontend, Backend, AI/ML, Design, DevOps) from 0-100
3. Identify 3-5 key strengths (specific skills, achievements, or experiences)
4. Identify 2-4 weaknesses or areas for improvement
5. Write a 1-sentence summary of their professional profile

Be honest but encouraging. Focus on concrete skills and experiences mentioned in the resume.

Response:`,
});

const resumeAnalysisFlow = ai.defineFlow(
  {
    name: 'resumeAnalysisFlow',
    inputSchema: ResumeAnalysisInputSchema,
    outputSchema: ResumeAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
