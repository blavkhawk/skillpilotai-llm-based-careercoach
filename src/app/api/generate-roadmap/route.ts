import { NextRequest, NextResponse } from 'next/server';
import { careerRoadmapFlow } from '@/ai/flows/career-roadmap';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received generate-roadmap request');
    const { currentSkills, targetRole, experience, timeframe } = await request.json();
    console.log('Target role:', targetRole);
    console.log('Current skills:', currentSkills);

    if (!currentSkills || !Array.isArray(currentSkills) || currentSkills.length === 0) {
      console.error('❌ Missing or invalid currentSkills');
      return NextResponse.json(
        { error: 'currentSkills array is required' },
        { status: 400 }
      );
    }

    if (!targetRole || typeof targetRole !== 'string') {
      console.error('❌ Missing or invalid targetRole');
      return NextResponse.json(
        { error: 'targetRole is required' },
        { status: 400 }
      );
    }

    console.log(`🗺️ Generating roadmap for ${targetRole}...`);

    const result = await careerRoadmapFlow({
      currentSkills,
      targetRole,
      experience,
      timeframe,
    });

    console.log(`✅ Successfully generated roadmap with ${result.roadmap.stages.length} stages`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to generate roadmap', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
