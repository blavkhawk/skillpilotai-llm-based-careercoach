'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for quiz generation
const QuizGenerationInputSchema = z.object({
  skill: z.string().describe('The skill to generate quiz questions for'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Difficulty level of the quiz'),
  questionCount: z.number().min(5).max(20).default(10).describe('Number of questions to generate'),
});

export type QuizGenerationInput = z.infer<typeof QuizGenerationInputSchema>;

// Output schema for quiz
const QuizOutputSchema = z.object({
  skill: z.string().describe('The skill being assessed'),
  difficulty: z.string().describe('Difficulty level'),
  questions: z.array(
    z.object({
      id: z.number().describe('Question ID'),
      question: z.string().describe('The question text'),
      options: z.array(z.string()).length(4).describe('Four answer options'),
      correctAnswer: z.number().min(0).max(3).describe('Index of the correct answer (0-3)'),
      explanation: z.string().describe('Explanation of the correct answer'),
      category: z.string().describe('Sub-category or topic within the skill'),
    })
  ).describe('Array of quiz questions'),
  passingScore: z.number().describe('Percentage needed to pass (e.g., 70)'),
});

export type QuizOutput = z.infer<typeof QuizOutputSchema>;

// Input schema for assessment results
const AssessmentResultsInputSchema = z.object({
  skill: z.string().describe('The skill that was assessed'),
  difficulty: z.string().describe('Difficulty level'),
  totalQuestions: z.number().describe('Total number of questions'),
  correctAnswers: z.number().describe('Number of correct answers'),
  incorrectCategories: z.array(z.string()).describe('Categories where user answered incorrectly'),
});

export type AssessmentResultsInput = z.infer<typeof AssessmentResultsInputSchema>;

// Output schema for assessment feedback
const AssessmentFeedbackSchema = z.object({
  overallScore: z.number().describe('Percentage score'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).describe('Assessed skill level'),
  passed: z.boolean().describe('Whether the user passed'),
  strengths: z.array(z.string()).describe('Areas where the user excelled'),
  weaknesses: z.array(z.string()).describe('Areas needing improvement'),
  recommendations: z.array(
    z.object({
      topic: z.string().describe('Topic to study'),
      reason: z.string().describe('Why this topic is recommended'),
      resources: z.array(z.string()).describe('Suggested learning resources'),
    })
  ).describe('Personalized learning recommendations'),
  nextSteps: z.array(z.string()).describe('Actionable next steps'),
});

export type AssessmentFeedback = z.infer<typeof AssessmentFeedbackSchema>;

// Flow to generate quiz questions
export async function generateQuiz(input: QuizGenerationInput): Promise<QuizOutput> {
  return generateQuizFlow(input);
}

// Flow to generate assessment feedback
export async function generateFeedback(input: AssessmentResultsInput): Promise<AssessmentFeedback> {
  return generateFeedbackFlow(input);
}

const quizPrompt = ai.definePrompt({
  name: 'quizGenerationPrompt',
  input: {
    schema: QuizGenerationInputSchema,
  },
  output: {
    schema: QuizOutputSchema,
  },
  prompt: `You are an expert technical interviewer and skills assessor.

Generate {{questionCount}} multiple-choice quiz questions for the skill: {{skill}}
Difficulty level: {{difficulty}}

REQUIREMENTS:
1. Questions should be practical and test real-world application
2. Each question must have exactly 4 options (A, B, C, D)
3. Only ONE option should be correct
4. Include a clear explanation for the correct answer
5. Cover different sub-topics/categories within the skill
6. Questions should progressively test understanding

DIFFICULTY GUIDELINES:
- BEGINNER: Basic concepts, definitions, syntax, simple examples
- INTERMEDIATE: Problem-solving, best practices, common patterns, debugging
- ADVANCED: Architecture, optimization, edge cases, complex scenarios

QUESTION DISTRIBUTION:
- Mix of conceptual and practical questions
- Include code snippets where appropriate
- Test both knowledge and application

Set the passing score to 70% for beginner, 75% for intermediate, and 80% for advanced.

Return the results as a JSON object conforming to this schema:
${JSON.stringify(QuizOutputSchema.describe, null, 2)}`,
});

const feedbackPrompt = ai.definePrompt({
  name: 'feedbackGenerationPrompt',
  input: {
    schema: AssessmentResultsInputSchema,
  },
  output: {
    schema: AssessmentFeedbackSchema,
  },
  prompt: `You are a supportive career coach providing personalized assessment feedback.

ASSESSMENT RESULTS:
- Skill: {{skill}}
- Difficulty: {{difficulty}}
- Score: {{correctAnswers}}/{{totalQuestions}} correct
- Weak areas: {{#if incorrectCategories}}{{#each incorrectCategories}}- {{{this}}}\n{{/each}}{{else}}None{{/if}}

TASK: Generate encouraging, actionable feedback for this user.

GUIDELINES:
1. Calculate the percentage score
2. Determine if they passed (70% for beginner, 75% for intermediate, 80% for advanced)
3. Assess their skill level based on performance
4. Identify 2-3 strengths (what they did well)
5. Identify 2-3 weaknesses (areas to improve)
6. Provide 3-4 specific learning recommendations with resources
7. Give 3-5 actionable next steps

Be encouraging but honest. Focus on growth mindset.

Return the results as a JSON object conforming to this schema:
${JSON.stringify(AssessmentFeedbackSchema.describe, null, 2)}`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: QuizGenerationInputSchema,
    outputSchema: QuizOutputSchema,
  },
  async (input) => {
    const { output } = await quizPrompt(input);
    return output!;
  }
);

const generateFeedbackFlow = ai.defineFlow(
  {
    name: 'generateFeedbackFlow',
    inputSchema: AssessmentResultsInputSchema,
    outputSchema: AssessmentFeedbackSchema,
  },
  async (input) => {
    const { output } = await feedbackPrompt(input);
    return output!;
  }
);
