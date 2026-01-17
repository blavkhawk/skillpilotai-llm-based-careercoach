import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, language, topics = [], perPage = 6 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build GitHub search query (simplified for better results)
    let searchQuery = query;
    
    // Add language filter if specified
    if (language) {
      searchQuery += ` language:${language}`;
    }
    
    // Add only first topic to avoid over-filtering
    if (topics.length > 0) {
      searchQuery += ` topic:${topics[0]}`;
    }

    // Add filters for quality projects (more lenient for better results)
    searchQuery += ' stars:>10';  // Lower threshold for more results

    const githubApiUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=${perPage}`;

    console.log(`🔍 Searching GitHub for: "${searchQuery}"`);
    console.log(`📍 GitHub API URL: ${githubApiUrl}`);

    // Prepare headers with optional authentication
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SkillPilotAI',
    };

    // Add GitHub token if available (increases rate limit from 60 to 5000 requests/hour)
    const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_API_KEY;
    if (githubToken && !githubToken.includes('msh')) {
      // Only use if it's a real GitHub token, not RapidAPI key
      headers['Authorization'] = `token ${githubToken}`;
      console.log('🔑 Using GitHub authentication token');
    } else {
      console.log('⚠️ No GitHub token found, using unauthenticated API (60 requests/hour limit)');
    }

    const response = await fetch(githubApiUrl, { headers });

    console.log(`📡 GitHub API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('⚠️ GitHub API failed:', response.status, errorText);
      console.log('⚠️ Falling back to mock data');
      const mockProjects = [
        {
          id: 1,
          name: 'awesome-project',
          fullName: 'developer/awesome-project',
          description: 'A comprehensive project showcasing best practices and modern development patterns.',
          url: 'https://github.com/developer/awesome-project',
          stars: 1250,
          forks: 320,
          language: language || 'JavaScript',
          topics: topics.length > 0 ? topics : ['web', 'tutorial', 'learning'],
          openIssues: 12,
          lastUpdated: '2024-10-15',
          owner: {
            login: 'developer',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
          },
        },
        {
          id: 2,
          name: 'learn-by-doing',
          fullName: 'coder/learn-by-doing',
          description: 'Hands-on tutorials and exercises for mastering programming concepts through practice.',
          url: 'https://github.com/coder/learn-by-doing',
          stars: 890,
          forks: 210,
          language: language || 'Python',
          topics: topics.length > 0 ? topics : ['education', 'tutorial', 'practice'],
          openIssues: 8,
          lastUpdated: '2024-10-20',
          owner: {
            login: 'coder',
            avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4',
          },
        },
        {
          id: 3,
          name: 'project-showcase',
          fullName: 'builder/project-showcase',
          description: 'Collection of real-world projects demonstrating practical application of programming skills.',
          url: 'https://github.com/builder/project-showcase',
          stars: 650,
          forks: 145,
          language: language || 'TypeScript',
          topics: topics.length > 0 ? topics : ['portfolio', 'projects', 'showcase'],
          openIssues: 5,
          lastUpdated: '2024-10-25',
          owner: {
            login: 'builder',
            avatarUrl: 'https://avatars.githubusercontent.com/u/3?v=4',
          },
        },
      ];
      return NextResponse.json({ projects: mockProjects });
    }

    const data = await response.json();
    console.log(`📦 GitHub API returned ${data.items?.length || 0} items`);
    console.log(`🔢 Total results available: ${data.total_count || 0}`);

    if (!data.items || data.items.length === 0) {
      console.log('⚠️ No projects found for query:', searchQuery);
      console.log('⚠️ Using fallback data');
      return NextResponse.json({
        projects: [
          {
            id: 1,
            name: 'example-project',
            fullName: 'user/example-project',
            description: 'An example project to get you started with learning and building.',
            url: 'https://github.com/user/example-project',
            stars: 500,
            forks: 120,
            language: language || 'JavaScript',
            topics: topics.length > 0 ? topics : ['beginner', 'tutorial'],
            openIssues: 10,
            lastUpdated: new Date().toISOString().split('T')[0],
            owner: {
              login: 'user',
              avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
            },
          },
        ],
      });
    }

    // Transform GitHub API response
    const projects = data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      fullName: item.full_name,
      description: item.description || 'No description available',
      url: item.html_url,
      stars: item.stargazers_count,
      forks: item.forks_count,
      language: item.language,
      topics: item.topics || [],
      openIssues: item.open_issues_count,
      lastUpdated: item.updated_at.split('T')[0],
      owner: {
        login: item.owner.login,
        avatarUrl: item.owner.avatar_url,
      },
    }));

    console.log(`✅ Fetched ${projects.length} GitHub projects`);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching GitHub projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
