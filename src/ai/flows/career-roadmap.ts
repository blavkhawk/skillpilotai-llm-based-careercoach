import { ai } from '../genkit';
import { z } from 'zod';

const RoadmapInputSchema = z.object({
  currentSkills: z.array(z.string()).describe('Array of user\'s current skills'),
  targetRole: z.string().describe('The career role the user wants to achieve'),
  experience: z.string().optional().describe('User\'s current experience level (beginner, intermediate, advanced)'),
  timeframe: z.string().optional().describe('Desired timeframe to achieve the goal (e.g., 6 months, 1 year)'),
});

const RoadmapOutputSchema = z.object({
  roadmap: z.object({
    overview: z.string().describe('High-level overview of the career path'),
    totalDuration: z.string().describe('Estimated total time to complete (e.g., "6-12 months")'),
    stages: z.array(z.object({
      stageNumber: z.number().describe('Stage number (1, 2, or 3)'),
      title: z.string().describe('Stage title'),
      duration: z.string().describe('Estimated duration for this stage'),
      objective: z.string().describe('What the user will achieve in this stage'),
      skills: z.array(z.string()).describe('Skills to learn in this stage'),
      milestones: z.array(z.string()).describe('Key milestones to complete'),
      resources: z.array(z.object({
        type: z.enum(['course', 'book', 'practice', 'project']).describe('Type of resource'),
        title: z.string().describe('Resource title'),
        description: z.string().describe('Brief description'),
      })),
      youtubeSearchQuery: z.string().describe('Search query to find YouTube tutorials for this stage'),
    })),
    nextSteps: z.array(z.string()).describe('Immediate action items to get started'),
  }),
});

export const careerRoadmapFlow = ai.defineFlow(
  {
    name: 'careerRoadmapFlow',
    inputSchema: RoadmapInputSchema,
    outputSchema: RoadmapOutputSchema,
  },
  async (input) => {
    const { currentSkills, targetRole, experience, timeframe } = input;

    console.log(`🗺️ Generating career roadmap for: ${targetRole}`);

    const prompt = `You are an expert career coach creating a detailed 3-stage learning roadmap.

User Profile:
- Current Skills: ${currentSkills.join(', ')}
- Target Role: ${targetRole}
${experience ? `- Experience Level: ${experience}` : ''}
${timeframe ? `- Desired Timeframe: ${timeframe}` : ''}

Create a comprehensive 3-stage career roadmap with:

Stage 1 - Foundation:
- Build fundamental skills needed for ${targetRole}
- Focus on core concepts and basics
- Duration: typically 2-4 months
- Should bridge gap from current skills to intermediate level

Stage 2 - Development:
- Develop intermediate to advanced skills
- Apply knowledge through practical projects
- Duration: typically 3-6 months
- Should cover industry-standard tools and practices

Stage 3 - Mastery & Specialization:
- Master advanced topics
- Specialize in high-demand areas
- Build portfolio and real-world experience
- Duration: typically 2-4 months
- Should prepare for job applications

For each stage provide:
1. Clear objective
2. Specific skills to learn
3. Key milestones (5-7 per stage)
4. Learning resources (courses, books, practice projects)
5. A YouTube search query that will help find tutorials (be specific, e.g., "React Hooks tutorial 2024" or "Machine Learning Python crash course")

Also provide:
- Overall timeline estimate
- High-level overview of the path
- 5 immediate next steps to get started

Make it actionable, realistic, and tailored to their current skill level.`;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt,
      output: {
        schema: RoadmapOutputSchema,
      },
    });

    console.log(`✅ Successfully generated ${llmResponse.output!.roadmap.stages.length}-stage roadmap`);

    return llmResponse.output!;
  }
);
