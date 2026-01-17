"use client";

import { useState } from "react";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Search, Bookmark, ExternalLink, Loader2, BookOpen, Star, Clock, BookmarkCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  skills: string[];
  level?: string;
  rating?: number;
  enrollmentCount?: number;
  imageUrl?: string;
  duration?: string;
  url?: string;
  certificateAvailable?: boolean;
}

interface MatchedCourse extends Course {
  matchScore: number;
  matchReason: string;
  relevantSkills: string[];
  learningPath: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  priority: 'high' | 'medium' | 'low';
}

const PriorityBadge = ({ priority }: { priority: 'high' | 'medium' | 'low' }) => {
  const colors = {
    high: 'bg-red-400/10 text-red-400 border-red-400/30',
    medium: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
    low: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
  };
  
  return (
    <Badge variant="outline" className={colors[priority]}>
      {priority.toUpperCase()}
    </Badge>
  );
};

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

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userSkills, setUserSkills] = useState("");
  const [targetSkills, setTargetSkills] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedCourses, setMatchedCourses] = useState<MatchedCourse[]>([]);
  const [savedCourseIds, setSavedCourseIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleCourseSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a topic or skill",
        variant: "destructive",
      });
      return;
    }

    if (!userSkills.trim()) {
      toast({
        title: "Current skills required",
        description: "Please enter your current skills",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setMatchedCourses([]);

    try {
      console.log("🔍 Fetching courses...");
      
      const response = await fetch('/api/fetch-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          limit: 20,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ API Error:", data.error);
        toast({
          title: "Search failed",
          description: data.error || "Failed to fetch courses",
          variant: "destructive",
        });
        setIsSearching(false);
        return;
      }

      const courses: Course[] = data.courses || [];
      console.log(`✅ Fetched ${courses.length} courses`);

      if (courses.length === 0) {
        toast({
          title: "No courses found",
          description: "Try different search terms",
        });
        setIsSearching(false);
        return;
      }

      setIsMatching(true);
      console.log("🔄 Starting course matching...");
      const matchResult = await performCourseMatching(courses);
      console.log("✅ Matching result:", matchResult);
      setMatchedCourses(matchResult);
    } catch (error) {
      console.error("❌ Full error object:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error message:", errorMessage);
      toast({
        title: "Search failed",
        description: errorMessage || "Please check console for details",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setIsMatching(false);
    }
  };

  const performCourseMatching = async (courses: Course[]): Promise<MatchedCourse[]> => {
    console.log("🎓 Matching courses...");
    const userSkillsArray = userSkills.split(',').map(s => s.trim()).filter(Boolean);
    const targetSkillsArray = targetSkills ? targetSkills.split(',').map(s => s.trim()).filter(Boolean) : undefined;

    const response = await fetch('/api/match-courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userSkills: userSkillsArray,
        targetSkills: targetSkillsArray,
        careerGoal: careerGoal || undefined,
        courses: courses.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          provider: c.provider,
          skills: c.skills,
          level: c.level,
          rating: c.rating,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to match courses');
    }

    const matchResult = await response.json();
    console.log("✅ Matching complete");

    // CRITICAL: Use array index to preserve original course data
    const matched = matchResult.matchedCourses.map((match: any, index: number) => {
      const originalCourse = courses[index];
      return {
        ...originalCourse,
        matchScore: match.matchScore,
        matchReason: match.matchReason,
        relevantSkills: match.relevantSkills,
        learningPath: match.learningPath,
        difficulty: match.difficulty,
        priority: match.priority,
      };
    });

    return matched;
  };

  const toggleSaveCourse = (courseId: string) => {
    setSavedCourseIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
        toast({ title: "Course removed" });
      } else {
        newSet.add(courseId);
        toast({ title: "Course saved!" });
      }
      return newSet;
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Course Recommendations"
        subtitle="AI-powered personalized learning"
      />

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-primary text-glow flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Find Your Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">What to learn? *</label>
            <Input
              placeholder="e.g., React, Machine Learning, AWS"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Skills *</label>
            <Input
              placeholder="e.g., JavaScript, HTML, CSS"
              value={userSkills}
              onChange={(e) => setUserSkills(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Skills (Optional)</label>
            <Input
              placeholder="e.g., React, TypeScript"
              value={targetSkills}
              onChange={(e) => setTargetSkills(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Career Goal (Optional)</label>
            <Textarea
              placeholder="e.g., Become a Full Stack Developer"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={handleCourseSearch}
            disabled={isSearching || isMatching}
            className="w-full button-glow"
          >
            {isSearching || isMatching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSearching ? 'Searching...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Courses
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {matchedCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary text-glow">
            {matchedCourses.length} Courses Recommended
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedCourses.map((course) => (
              <Card key={course.id} className="card-glow group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-primary text-glow flex-1 pr-2">
                      {course.title}
                    </h3>
                    <ProgressCircle percentage={course.matchScore} />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {course.provider}
                    </Badge>
                    <PriorityBadge priority={course.priority} />
                  </div>

                  {course.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{course.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {course.duration && (
                    <div className="flex items-center gap-1 mb-3">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{course.duration}</span>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {course.matchReason}
                  </p>

                  {course.relevantSkills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1">You'll Learn:</p>
                      <div className="flex flex-wrap gap-1">
                        {course.relevantSkills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} className="bg-blue-400/10 text-blue-400 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSaveCourse(course.id)}
                    >
                      {savedCourseIds.has(course.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 button-glow"
                      onClick={() => course.url && window.open(course.url, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      View Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
