import { ai } from '@/ai/genkit';
import { z } from 'zod';

const JobMatchInputSchema = z.object({
  userSkills: z.array(z.string()).describe('List of user skills from resume/profile'),
  userExperience: z.string().optional().describe('User experience level (entry, mid, senior)'),
  userInterests: z.array(z.string()).optional().describe('User career interests'),
  jobs: z.array(z.object({
    id: z.string(),
    title: z.string(),
    company: z.string(),
    location: z.string(),
    description: z.string(),
    skills: z.array(z.string()),
  })),
});

const JobMatchOutputSchema = z.object({
  matchedJobs: z.array(z.object({
    jobId: z.string(),
    matchScore: z.number().min(0).max(100).describe('Compatibility score 0-100'),
    matchReason: z.string().describe('Brief explanation of why this job matches'),
    matchedSkills: z.array(z.string()).describe('User skills that match this job'),
    missingSkills: z.array(z.string()).describe('Skills needed but user lacks'),
  })),
});

export const jobMatchingFlow = ai.defineFlow(
  {
    name: 'jobMatchingFlow',
    inputSchema: JobMatchInputSchema,
    outputSchema: JobMatchOutputSchema,
  },
  async (input) => {
    const { userSkills, userExperience, userInterests, jobs } = input;

    const prompt = `You are an AI career matching expert. Analyze how well these jobs match the user's profile.

User Profile:
- Skills: ${userSkills.join(', ')}
${userExperience ? `- Experience Level: ${userExperience}` : ''}
${userInterests && userInterests.length > 0 ? `- Interests: ${userInterests.join(', ')}` : ''}

Jobs to Match:
${jobs.map((job, i) => `
${i + 1}. ${job.title} at ${job.company}
   Location: ${job.location}
   Required Skills: ${job.skills.join(', ')}
   Description: ${job.description}
`).join('\n')}

For each job, calculate:
1. matchScore (0-100): Based on skill overlap, experience fit, and interest alignment
2. matchReason: 1-2 sentence explanation of the match quality
3. matchedSkills: User skills that align with job requirements
4. missingSkills: Important skills the user should learn for this role

Scoring Guidelines:
- 90-100: Excellent match, user has most/all required skills
- 75-89: Good match, user has core skills, minor gaps
- 60-74: Fair match, user has some skills, notable gaps
- 40-59: Moderate match, significant upskilling needed
- 0-39: Poor match, major skill mismatch

Return all jobs sorted by matchScore (highest first).`;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt,
      output: {
        format: 'json',
        schema: JobMatchOutputSchema,
      },
    });

    return llmResponse.output!;
  }
);
