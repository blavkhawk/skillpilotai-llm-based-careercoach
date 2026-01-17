"use client";

import { useState } from "react";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Target, Clock, CheckCircle2, Loader2, Play, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Stage {
  stageNumber: number;
  title: string;
  duration: string;
  objective: string;
  skills: string[];
  milestones: string[];
  resources: Array<{
    type: 'course' | 'book' | 'practice' | 'project';
    title: string;
    description: string;
  }>;
  youtubeSearchQuery: string;
}

interface Roadmap {
  overview: string;
  totalDuration: string;
  stages: Stage[];
  nextSteps: string[];
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  url: string;
}

const ResourceBadge = ({ type }: { type: string }) => {
  const colors = {
    course: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
    book: 'bg-purple-400/10 text-purple-400 border-purple-400/30',
    practice: 'bg-green-400/10 text-green-400 border-green-400/30',
    project: 'bg-orange-400/10 text-orange-400 border-orange-400/30',
  };
  
  return (
    <Badge variant="outline" className={colors[type as keyof typeof colors] || 'bg-gray-400/10 text-gray-400'}>
      {type}
    </Badge>
  );
};

export default function CareerPathPage() {
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [stageVideos, setStageVideos] = useState<Record<number, YouTubeVideo[]>>({});
  const [loadingVideos, setLoadingVideos] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const handleGenerateRoadmap = async () => {
    if (!currentSkills.trim() || !targetRole.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide current skills and target role",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setRoadmap(null);
    setStageVideos({});

    try {
      console.log("🗺️ Generating roadmap...");
      const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);
      
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSkills: skillsArray,
          targetRole: targetRole.trim(),
          experience: experience || undefined,
          timeframe: timeframe || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      const result = await response.json();
      console.log("✅ Roadmap generated");
      setRoadmap(result.roadmap);
      
      toast({
        title: "Roadmap generated!",
        description: `Created ${result.roadmap.stages.length}-stage plan`,
      });
    } catch (error) {
      console.error("❌ Error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchYouTubeVideos = async (stageNumber: number, query: string) => {
    if (loadingVideos.has(stageNumber)) return;
    
    setLoadingVideos(prev => new Set(prev).add(stageNumber));
    
    try {
      console.log(`🎥 Fetching videos for stage ${stageNumber}...`);
      const response = await fetch('/api/fetch-youtube-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, maxResults: 3 }),
      });

      if (!response.ok) throw new Error('Failed to fetch videos');

      const data = await response.json();
      console.log(`✅ Fetched ${data.videos.length} videos`);
      setStageVideos(prev => ({ ...prev, [stageNumber]: data.videos }));
    } catch (error) {
      console.error("❌ Error:", error);
      toast({ title: "Failed to load videos", variant: "destructive" });
    } finally {
      setLoadingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(stageNumber);
        return newSet;
      });
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader title="Career Roadmap" subtitle="Your personalized path to success" />

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-primary text-glow flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Generate Your Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Role *</label>
            <Input placeholder="e.g., Full Stack Developer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Skills *</label>
            <Textarea placeholder="e.g., JavaScript, HTML, CSS" value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Experience Level</label>
              <Input placeholder="e.g., beginner" value={experience} onChange={(e) => setExperience(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <Input placeholder="e.g., 6 months" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleGenerateRoadmap} disabled={isGenerating} className="w-full button-glow">
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Target className="mr-2 h-4 w-4" />Generate Roadmap</>
            )}
          </Button>
        </CardContent>
      </Card>

      {roadmap && (
        <div className="space-y-6">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-primary text-glow">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">{roadmap.overview}</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Duration: {roadmap.totalDuration}</span>
              </div>
            </CardContent>
          </Card>

          {roadmap.stages.map((stage) => (
            <Card key={stage.stageNumber} className="card-glow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/20 text-primary">Stage {stage.stageNumber}</Badge>
                  <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{stage.duration}</Badge>
                </div>
                <CardTitle className="text-2xl text-primary text-glow">{stage.title}</CardTitle>
                <p className="text-muted-foreground mt-2">{stage.objective}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />Skills to Learn
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {stage.skills.map((skill, idx) => (
                      <Badge key={idx} className="bg-blue-400/10 text-blue-400">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />Key Milestones
                  </h4>
                  <ul className="space-y-2">
                    {stage.milestones.map((milestone, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {stage.resources.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Resources</h4>
                    <div className="grid gap-3">
                      {stage.resources.map((resource, idx) => {
                        const searchQuery = `${resource.title} ${resource.type}`;
                        const searchUrl = resource.type === 'course' 
                          ? `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' online course')}`
                          : resource.type === 'book'
                          ? `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' book')}`
                          : `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
                        
                        return (
                          <a
                            key={idx}
                            href={searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border hover:border-primary transition-colors group"
                          >
                            <ResourceBadge type={resource.type} />
                            <div className="flex-1">
                              <p className="font-medium text-sm group-hover:text-primary transition-colors">{resource.title}</p>
                              <p className="text-xs text-muted-foreground">{resource.description}</p>
                            </div>
                            <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />Video Tutorials
                    </h4>
                    {!stageVideos[stage.stageNumber] && (
                      <Button size="sm" variant="outline" onClick={() => fetchYouTubeVideos(stage.stageNumber, stage.youtubeSearchQuery)} disabled={loadingVideos.has(stage.stageNumber)}>
                        {loadingVideos.has(stage.stageNumber) ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <><Play className="h-3 w-3 mr-1" />Load Videos</>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {stageVideos[stage.stageNumber] && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {stageVideos[stage.stageNumber].map((video) => (
                        <a key={video.id} href={video.url} target="_blank" rel="noopener noreferrer" className="group block rounded-lg overflow-hidden border hover:border-primary transition-colors">
                          <div className="relative">
                            <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="h-12 w-12 text-white" />
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{video.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-primary text-glow">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {roadmap.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center">{idx + 1}</div>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
