import { ai } from '../genkit';
import { z } from 'zod';

const CourseInputSchema = z.object({
  userSkills: z.array(z.string()).describe('Array of user\'s current skills'),
  targetSkills: z.array(z.string()).optional().describe('Skills the user wants to learn'),
  careerGoal: z.string().optional().describe('User\'s career goal or desired role'),
  courses: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    provider: z.string(),
    skills: z.array(z.string()),
    level: z.string().optional(),
    rating: z.number().optional(),
    enrollmentCount: z.number().optional(),
  })),
});

const CourseOutputSchema = z.object({
  matchedCourses: z.array(z.object({
    courseId: z.string(),
    matchScore: z.number().min(0).max(100).describe('Match score from 0-100'),
    matchReason: z.string().describe('Brief explanation of why this course matches'),
    relevantSkills: z.array(z.string()).describe('Skills from the course that match user needs'),
    learningPath: z.string().describe('How this course fits into the user\'s learning journey'),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Recommended difficulty level'),
    priority: z.enum(['high', 'medium', 'low']).describe('Priority for taking this course'),
  })),
});

export const courseMatchingFlow = ai.defineFlow(
  {
    name: 'courseMatchingFlow',
    inputSchema: CourseInputSchema,
    outputSchema: CourseOutputSchema,
  },
  async (input) => {
    const { userSkills, targetSkills, careerGoal, courses } = input;

    console.log(`🎓 Matching ${courses.length} courses with user profile...`);

    const prompt = `You are an expert learning advisor helping users find the best courses for their skill development.

User Profile:
- Current Skills: ${userSkills.join(', ')}
${targetSkills ? `- Target Skills: ${targetSkills.join(', ')}` : ''}
${careerGoal ? `- Career Goal: ${careerGoal}` : ''}

Available Courses:
${courses.map(course => `
- ID: ${course.id}
  Title: ${course.title}
  Provider: ${course.provider}
  Description: ${course.description}
  Skills Covered: ${course.skills.join(', ')}
  ${course.level ? `Level: ${course.level}` : ''}
  ${course.rating ? `Rating: ${course.rating}/5` : ''}
  ${course.enrollmentCount ? `Enrollments: ${course.enrollmentCount.toLocaleString()}` : ''}
`).join('\n')}

Task: Analyze each course and provide:
1. A match score (0-100) based on:
   - Relevance to user's current skills (can they understand it?)
   - Relevance to target skills (will it help them reach their goals?)
   - Alignment with career goal
   - Course quality (rating and popularity)
   - Skill gap filling (addresses missing skills)

2. A clear explanation of why the course matches

3. Which specific skills from the course are relevant to the user

4. How this course fits into their learning journey (foundation, advancement, specialization)

5. Recommended difficulty level for this user

6. Priority level (high/medium/low) for taking this course

Return ALL courses with their analysis, sorted by match score (highest first).`;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt,
      output: {
        schema: CourseOutputSchema,
      },
    });

    console.log(`✅ Successfully matched ${courses.length} courses`);

    return llmResponse.output!;
  }
);
