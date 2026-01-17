import { NextRequest, NextResponse } from 'next/server';
import { courseMatchingFlow } from '@/ai/flows/course-matching';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received match-courses request');
    const { userSkills, targetSkills, careerGoal, courses } = await request.json();
    console.log('User skills:', userSkills);
    console.log('Courses to match:', courses?.length);

    if (!userSkills || !Array.isArray(userSkills) || userSkills.length === 0) {
      console.error('❌ Missing or invalid userSkills');
      return NextResponse.json(
        { error: 'userSkills array is required' },
        { status: 400 }
      );
    }

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      console.error('❌ Missing or invalid courses array');
      return NextResponse.json(
        { error: 'courses array is required' },
        { status: 400 }
      );
    }

    console.log(`🎓 Matching ${courses.length} courses with user skills...`);

    const result = await courseMatchingFlow({
      userSkills,
      targetSkills,
      careerGoal,
      courses,
    });

    console.log(`✅ Successfully matched ${result.matchedCourses.length} courses`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error matching courses:', error);
    return NextResponse.json(
      { error: 'Failed to match courses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
