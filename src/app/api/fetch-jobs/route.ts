import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, location, numPages } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const rapidApiKey = process.env.RAPID_API_KEY;
    if (!rapidApiKey || rapidApiKey === 'your_rapidapi_key_here') {
      return NextResponse.json(
        { 
          error: 'RapidAPI key not configured. Please add RAPID_API_KEY to .env.local',
          useMockData: true 
        },
        { status: 400 }
      );
    }

    const url = 'https://jsearch.p.rapidapi.com/search';
    const params = new URLSearchParams({
      query: query,
      page: '1',
      num_pages: (numPages || 1).toString(),
      date_posted: 'all',
    });

    if (location) {
      params.append('location', location);
    }

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Log the first job to see its structure
    if (data.data && data.data.length > 0) {
      console.log('📋 Sample job from API:', {
        job_id: data.data[0].job_id,
        job_title: data.data[0].job_title,
        job_apply_link: data.data[0].job_apply_link,
        job_apply_quality_score: data.data[0].job_apply_quality_score,
        job_google_link: data.data[0].job_google_link,
        available_fields: Object.keys(data.data[0])
      });
    }
    
    // Transform the response to a cleaner format
    const jobs = (data.data || []).map((job: any) => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city || job.job_state || job.job_country || 'Remote',
      description: job.job_description?.substring(0, 500) || '',
      skills: job.job_required_skills || [],
      applyLink: job.job_apply_link || job.job_google_link || null,
      postedAt: job.job_posted_at_datetime_utc,
      employmentType: job.job_employment_type,
      salary: job.job_salary || null,
    }));
    
    console.log(`✅ Transformed ${jobs.length} jobs, ${jobs.filter((j: any) => j.applyLink).length} have apply links`);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
