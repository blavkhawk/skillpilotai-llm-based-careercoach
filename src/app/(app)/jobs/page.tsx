"use client";

import { useState } from "react";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search, Bookmark, ExternalLink, Loader2, Briefcase, Building, BookmarkCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  applyLink?: string;
  postedAt?: string;
  employmentType?: string;
  salary?: string | null;
}

interface MatchedJob extends Job {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
}

const ProgressCircle = ({ percentage }: { percentage: number }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  let colorClass = "text-green-400";
  if (percentage < 80) colorClass = "text-yellow-400";
  if (percentage < 60) colorClass = "text-orange-400";
  
  return (
    <div className="relative h-14 w-14">
      <svg className="absolute top-0 left-0" width="56" height="56" viewBox="0 0 56 56">
        <circle
          className="text-primary/10"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="28"
          cy="28"
        />
        <circle
          className={colorClass}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="28"
          cy="28"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-bold text-sm ${colorClass}`}>
        {percentage}%
      </div>
    </div>
  );
};

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [userSkills, setUserSkills] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleJobSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a job title or keyword",
        variant: "destructive",
      });
      return;
    }

    if (!userSkills.trim()) {
      toast({
        title: "Skills required",
        description: "Please enter your skills for job matching",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setMatchedJobs([]);

    try {
      console.log("🔍 Fetching jobs from API...");
      console.log("📝 Search params:", { query: searchQuery, location, skills: userSkills });
      const response = await fetch('/api/fetch-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          location: location || undefined,
          numPages: 1,
        }),
      });

      console.log("📡 Response status:", response.status, response.ok);
      const data = await response.json();
      console.log("📦 Response data:", data);

      if (!response.ok) {
        if (data.useMockData) {
          console.log("⚠️ Using mock data (RapidAPI key not configured)");
          const mockJobs: Job[] = [
            {
              id: "mock-1",
              title: "Senior Frontend Developer",
              company: "TechCorp Inc",
              location: "Remote",
              description: "We're looking for an experienced frontend developer with expertise in React and modern web technologies.",
              skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
              applyLink: "https://www.example.com/apply",
              employmentType: "Full-time",
              salary: "$120k - $150k",
            },
            {
              id: "mock-2",
              title: "Full Stack Engineer",
              company: "StartupX",
              location: "San Francisco, CA",
              description: "Join our team to build scalable web applications using modern technologies and cloud infrastructure.",
              skills: ["Node.js", "React", "PostgreSQL", "Docker", "AWS"],
              applyLink: "https://www.example.com/apply",
              employmentType: "Full-time",
              salary: "$130k - $160k",
            },
            {
              id: "mock-3",
              title: "AI/ML Engineer",
              company: "AI Labs",
              location: "Remote",
              description: "Work on cutting-edge machine learning projects and deploy AI models at scale.",
              skills: ["Python", "TensorFlow", "PyTorch", "AWS", "Docker"],
              applyLink: "https://www.example.com/apply",
              employmentType: "Full-time",
              salary: "$140k - $180k",
            }
          ];
          
          setIsMatching(true);
          const matchResult = await performJobMatching(mockJobs);
          setMatchedJobs(matchResult);
        } else {
          throw new Error(data.error || 'Failed to fetch jobs');
        }
      } else {
        const jobs: Job[] = data.jobs;
        console.log(` Fetched ${jobs.length} jobs`);
        console.log('🔗 Jobs with apply links:', jobs.map(j => ({ title: j.title, applyLink: j.applyLink })));
        console.log('📋 First job full data:', jobs[0]);

        if (jobs.length === 0) {
          toast({
            title: "No jobs found",
            description: "Try different search terms",
          });
          setIsSearching(false);
          return;
        }

        setIsMatching(true);
        const matchResult = await performJobMatching(jobs);
        setMatchedJobs(matchResult);
      }
    } catch (error) {
      console.error(" Error:", error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Failed",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setIsMatching(false);
    }
  };

  const performJobMatching = async (jobs: Job[]): Promise<MatchedJob[]> => {
    console.log("🤖 Matching jobs with AI...");
    const skillsArray = userSkills.split(',').map(s => s.trim()).filter(Boolean);

    // Call the API route instead of importing the flow directly
    const response = await fetch('/api/match-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userSkills: skillsArray,
        jobs: jobs.map(j => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          description: j.description,
          skills: j.skills,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to match jobs');
    }

    const matchResult = await response.json();
    console.log("✅ Job matching complete");
    console.log("📊 Match result:", matchResult);

    // Map by index to preserve order and original job data
    const matched = matchResult.matchedJobs.map((match: any, index: number) => {
      const originalJob = jobs[index]; // preserve order instead of matching ID
      console.log(`🔗 Job ${index}:`, { 
        title: originalJob.title, 
        applyLink: originalJob.applyLink,
        matchScore: match.matchScore 
      });
      return {
        ...originalJob,
        matchScore: match.matchScore,
        matchReason: match.matchReason,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
      };
    });

    console.log("✅ Final matched jobs:", matched.map(j => ({ title: j.title, applyLink: j.applyLink })));
    return matched;
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        toast({ title: "Job removed from saved" });
      } else {
        newSet.add(jobId);
        toast({ title: "Job saved!" });
      }
      return newSet;
    });
  };

  const savedJobs = matchedJobs.filter(job => savedJobIds.has(job.id));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Job Matching"
        subtitle="AI-powered job search"
      />

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-primary text-glow flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Find Your Next Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <Input
                placeholder="e.g., Frontend Developer"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="e.g., Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Skills</label>
            <Input
              placeholder="e.g., React, TypeScript, Node.js"
              value={userSkills}
              onChange={(e) => setUserSkills(e.target.value)}
            />
          </div>
          <Button
            onClick={handleJobSearch}
            disabled={isSearching || isMatching}
            className="w-full button-glow"
          >
            {isSearching || isMatching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search & Match Jobs
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {matchedJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchedJobs.map((job) => (
            <Card key={job.id} className="card-glow group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-bold text-primary text-glow group-hover:text-glow-accent transition-all mb-2">
                      {job.title || 'Untitled Position'}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{job.company || 'Unknown Company'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{job.location || 'Location not specified'}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ProgressCircle percentage={job.matchScore} />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {job.matchReason || 'AI matching analysis'}
                </p>

                {job.matchedSkills && job.matchedSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-green-400 mb-2">Matching Skills:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.matchedSkills.slice(0, 4).map((s) => (
                        <Badge key={s} className="bg-green-400/10 text-green-400 text-xs">{s}</Badge>
                      ))}
                      {job.matchedSkills.length > 4 && (
                        <Badge className="bg-green-400/10 text-green-400 text-xs">
                          +{job.matchedSkills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSaveJob(job.id)}
                    className="hover:bg-accent/10"
                  >
                    {savedJobIds.has(job.id) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 button-glow"
                    onClick={() => {
                      if (job.applyLink) {
                        window.open(job.applyLink, '_blank');
                      } else {
                        toast({
                          title: "No apply link",
                          description: "This job doesn't have a direct apply link",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    {job.applyLink ? 'Apply Now' : 'No Link Available'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
