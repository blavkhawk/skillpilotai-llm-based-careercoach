import { NextRequest, NextResponse } from 'next/server';
import { jobMatchingFlow } from '@/ai/flows/job-matching';

export async function POST(request: NextRequest) {
  try {
    const { userSkills, userExperience, userInterests, jobs } = await request.json();

    if (!userSkills || !Array.isArray(userSkills) || userSkills.length === 0) {
      return NextResponse.json({ error: 'User skills are required' }, { status: 400 });
    }

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: 'Jobs array is required' }, { status: 400 });
    }

    console.log(`🤖 Matching ${jobs.length} jobs with user skills...`);

    const matchResult = await jobMatchingFlow({
      userSkills,
      userExperience,
      userInterests,
      jobs,
    });

    console.log(`✅ Successfully matched ${matchResult.matchedJobs.length} jobs`);

    return NextResponse.json(matchResult);
  } catch (error) {
    console.error('❌ Error matching jobs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to match jobs', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
