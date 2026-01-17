import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received fetch-courses request');
    const { query, limit = 20 } = await request.json();
    console.log('Query:', query, 'Limit:', limit);

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.COURSERA_API_KEY;
    console.log('API Key present:', !!apiKey);

    if (!apiKey) {
      console.log('⚠️ COURSERA_API_KEY not configured, returning mock data');
      
      // Return mock data directly instead of error
      const mockCourses = [
        {
          id: "mock-react-1",
          title: "React - The Complete Guide 2025",
          description: "Master React 18+ with Hooks, Context API, Redux Toolkit, React Router, and Next.js. Build modern web applications with the latest React features.",
          provider: "Udemy",
          skills: ["React", "JavaScript", "Redux", "Next.js", "TypeScript"],
          level: "intermediate",
          rating: 4.7,
          enrollmentCount: 250000,
          imageUrl: "https://via.placeholder.com/400x300",
          duration: "40 hours",
          url: "https://www.udemy.com/course/react-the-complete-guide",
          certificateAvailable: true,
        },
        {
          id: "mock-ml-1",
          title: "Machine Learning A-Z: Python & R",
          description: "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts. Code templates included.",
          provider: "Coursera",
          skills: ["Machine Learning", "Python", "Data Science", "AI", "TensorFlow"],
          level: "beginner",
          rating: 4.5,
          enrollmentCount: 180000,
          imageUrl: "https://via.placeholder.com/400x300",
          duration: "44 hours",
          url: "https://www.coursera.org/learn/machine-learning",
          certificateAvailable: true,
        },
        {
          id: "mock-aws-1",
          title: "AWS Certified Solutions Architect",
          description: "Pass the AWS Solutions Architect Associate exam with this comprehensive course covering all AWS services.",
          provider: "A Cloud Guru",
          skills: ["AWS", "Cloud Computing", "DevOps", "Architecture"],
          level: "intermediate",
          rating: 4.6,
          enrollmentCount: 120000,
          imageUrl: "https://via.placeholder.com/400x300",
          duration: "25 hours",
          url: "https://acloudguru.com/course/aws-certified-solutions-architect-associate",
          certificateAvailable: true,
        },
      ];
      
      return NextResponse.json({ courses: mockCourses });
    }

    // Coursera API endpoint (using RapidAPI)
    const url = `https://coursera-course-search.p.rapidapi.com/courses?query=${encodeURIComponent(query)}&limit=${limit}`;

    console.log(`🎓 Fetching courses for query: "${query}"`);
    console.log(`📡 API URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'coursera-course-search.p.rapidapi.com',
      },
    });

    console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // If API fails, fall back to mock data instead of erroring
      console.log('⚠️ API failed, falling back to mock data');
      const mockCourses = [
        {
          id: "mock-react-1",
          title: "React - The Complete Guide 2025",
          description: "Master React 18+ with Hooks, Context API, Redux Toolkit, React Router, and Next.js. Build modern web applications with the latest React features.",
          provider: "Udemy",
          skills: ["React", "JavaScript", "Redux", "Next.js", "TypeScript"],
          level: "intermediate",
          rating: 4.7,
          enrollmentCount: 250000,
          imageUrl: "https://via.placeholder.com/400x300",
          duration: "40 hours",
          url: "https://www.udemy.com/course/react-the-complete-guide",
          certificateAvailable: true,
        },
        {
          id: "mock-ml-1",
          title: "Machine Learning A-Z: Python & R",
          description: "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts. Code templates included.",
          provider: "Coursera",
          skills: ["Machine Learning", "Python", "Data Science", "AI", "TensorFlow"],
          level: "beginner",
          rating: 4.5,
          enrollmentCount: 180000,
          imageUrl: "https://via.placeholder.com/400x300",
          duration: "44 hours",
          url: "https://www.coursera.org/learn/machine-learning",
          certificateAvailable: true,
        },
        {
          id: "mock-aws-1",
          title: "AWS Certified Solutions Architect",
          description: "Pass the AWS Solutions Architect Associate exam with this comprehensive course covering all AWS services.",
          provider: "A Cloud Guru",
          skills: ["AWS", "Cloud Computing", "DevOps", "Architecture"],
          level: "intermediate",
          rating: 4.6,
          enrollmentCount: 120000,
          imageUrl: "https://via.placeholder.com/400x300",
          duration: "25 hours",
          url: "https://acloudguru.com/course/aws-certified-solutions-architect-associate",
          certificateAvailable: true,
        },
      ];
      return NextResponse.json({ courses: mockCourses });
    }

    const data = await response.json();
    
    // Log the first course to see structure
    if (data.courses && data.courses.length > 0) {
      console.log('📋 Sample course from API:', {
        id: data.courses[0].id,
        name: data.courses[0].name,
        available_fields: Object.keys(data.courses[0])
      });
    }
    
    // Transform the response to a cleaner format
    const courses = (data.courses || []).map((course: any) => ({
      id: course.id || course.slug,
      title: course.name || course.title,
      description: course.description?.substring(0, 300) || '',
      provider: course.partners?.[0]?.name || course.partner || 'Coursera',
      skills: course.skills || course.domainTypes || [],
      level: course.level || course.difficultyLevel,
      rating: course.avgProductRating || course.rating,
      enrollmentCount: course.enrollment || course.enrollmentNumber,
      imageUrl: course.photoUrl || course.s12nLogoUrl,
      duration: course.workload || course.duration,
      url: course.url || `https://www.coursera.org/learn/${course.slug || course.id}`,
      certificateAvailable: course.certificates?.length > 0 || course.certificate,
    }));

    console.log(`✅ Transformed ${courses.length} courses`);

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
