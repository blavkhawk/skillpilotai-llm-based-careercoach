import { NextRequest, NextResponse } from 'next/server';
import { recommendProjects } from '@/ai/flows/skill-based-project-recommendations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skills, careerGoals, portfolioProjects } = body;

    // Validation
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: 'Skills array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!careerGoals || typeof careerGoals !== 'string') {
      return NextResponse.json(
        { error: 'Career goals are required' },
        { status: 400 }
      );
    }

    console.log('🚀 Generating project recommendations...');
    console.log('Skills:', skills);
    console.log('Career Goals:', careerGoals);

    // Call the AI flow
    const result = await recommendProjects({
      userSkills: skills,
      careerGoals,
      portfolioProjects: portfolioProjects || [],
    });

    console.log('✅ Project recommendations generated successfully');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating project recommendations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
