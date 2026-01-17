"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/page-header";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Bot, Flame, Loader, Star, GitFork, ExternalLink, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AIProject {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  skillsRequired: string[];
  estimatedTime: string;
}

interface GitHubProject {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  openIssues: number;
  lastUpdated: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  matchScore?: number;
}

const DifficultyFlames = ({
  difficulty,
}: {
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}) => {
  const levels = { Beginner: 1, Intermediate: 2, Advanced: 3 };
  const level = levels[difficulty] || 1;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <Flame
          key={i}
          className={cn(
            "h-4 w-4",
            i < level ? "text-accent" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
};

export default function ProjectsPage() {
  const [skills, setSkills] = useState("");
  const [careerGoals, setCareerGoals] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiProjects, setAiProjects] = useState<AIProject[]>([]);
  const [githubProjects, setGithubProjects] = useState<GitHubProject[]>([]);
  const { toast } = useToast();

  const handleRecommend = async () => {
    if (!skills.trim() || !careerGoals.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter your skills and career goals.",
      });
      return;
    }

    setLoading(true);
    setAiProjects([]);
    setGithubProjects([]);
    
    try {
      const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      
      // Get AI project recommendations via API route
      console.log('🚀 Fetching project recommendations...');
      const aiResponse = await fetch('/api/recommend-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: skillsArray,
          careerGoals,
          portfolioProjects: [],
        }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to get AI recommendations');
      }

      const aiData = await aiResponse.json();
      console.log('✅ AI Response:', aiData);
      setAiProjects(aiData.projects || []);

      // Fetch GitHub projects for the first AI recommendation
      if (aiData.projects && aiData.projects.length > 0) {
        const firstProject = aiData.projects[0];
        // Create a simpler, more effective search query using only key skills
        const primarySkills = skillsArray.slice(0, 2); // Use first 2 skills from user input
        const searchQuery = primarySkills.join(' ');
        
        console.log('🔍 Fetching GitHub projects with query:', searchQuery);
        const githubResponse = await fetch('/api/fetch-github-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            language: language && language !== 'any' ? language : undefined,
            topics: primarySkills,  // Use the same primary skills as topics
            perPage: 6,
          }),
        });

        if (githubResponse.ok) {
          const githubData = await githubResponse.json();
          console.log('✅ GitHub projects fetched:', githubData);
          // Add match scores to GitHub projects
          const projectsWithScores = (githubData.projects || []).map((proj: GitHubProject, index: number) => ({
            ...proj,
            matchScore: 95 - (index * 5), // Simple scoring based on GitHub's star ranking
          }));
          setGithubProjects(projectsWithScores);
        } else {
          console.error('GitHub API error:', await githubResponse.text());
        }
      }

      toast({
        title: "Projects Found!",
        description: `Generated ${aiData.projects.length} personalized project recommendations.`,
      });
    } catch (error) {
      console.error('Full error:', error);
      toast({
        variant: "destructive",
        title: "Error Getting Recommendations",
        description: error instanceof Error ? error.message : "There was an issue getting project recommendations. Please try again.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Project Recommendations"
        subtitle="AI-curated projects to build your portfolio and sharpen your skills."
      />
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="font-headline">Find Your Next Project</CardTitle>
          <CardDescription>Get personalized project ideas and discover similar open-source projects on GitHub</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="skills">Your Skills *</Label>
            <Input
              id="skills"
              placeholder="e.g., react, python, typescript"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goals">Career Goals *</Label>
            <Input
              id="goals"
              placeholder="e.g., become a full-stack developer"
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Programming Language</Label>
            <Select value={language || undefined} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Any Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Language</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleRecommend}
              disabled={loading}
              className="w-full button-glow bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              Get Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="font-semibold text-primary">Generating personalized project recommendations...</p>
          <p className="text-sm text-muted-foreground mt-2">Analyzing your skills and searching GitHub...</p>
        </div>
      )}

      {/* AI Project Recommendations */}
      {aiProjects.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-glow">AI-Generated Project Ideas</h2>
            <p className="text-sm text-muted-foreground">Personalized projects designed to help you grow</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiProjects.map((project, index) => (
              <Card key={index} className="card-glow flex flex-col group hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-glow text-primary group-hover:text-glow-accent transition-all">
                      {project.title}
                    </CardTitle>
                    <DifficultyFlames difficulty={project.difficulty} />
                  </div>
                  <CardDescription>{project.estimatedTime}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div>
                    <p className="text-xs font-semibold mb-2">Skills Required:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.skillsRequired.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* GitHub Project Examples */}
      {githubProjects.length > 0 && (
        <div className="space-y-4 mt-8">
          <div>
            <h2 className="text-2xl font-bold text-glow">Real Projects from GitHub</h2>
            <p className="text-sm text-muted-foreground">Open-source projects for inspiration and learning</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {githubProjects.map((project) => (
              <Card key={project.id} className="card-glow flex flex-col group hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <img 
                      src={project.owner.avatarUrl} 
                      alt={project.owner.login}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-xs">{project.owner.login}</CardDescription>
                    </div>
                    {project.matchScore && (
                      <Badge variant="default" className="bg-primary/20 text-primary border-primary/50">
                        {project.matchScore}% Match
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {project.language && (
                      <div className="flex items-center gap-1">
                        <Code2 className="h-4 w-4" />
                        <span>{project.language}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{project.stars.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      <span>{project.forks.toLocaleString()}</span>
                    </div>
                  </div>

                  {project.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardContent className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-primary/10 hover:text-primary border-primary/30"
                    onClick={() => window.open(project.url, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
