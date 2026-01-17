import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/page-header";
import SkillRadarChart from "@/components/dashboard/overview";
import { ArrowUpRight, CheckCircle, Lightbulb, Target } from "lucide-react";
import ProgressRings from "@/components/dashboard/progress-rings";

const strengths = ["React", "Node.js", "System Design", "TypeScript"];
const weaknesses = ["Python", "Machine Learning", "Cloud Security"];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back, let's supercharge your career."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-2 card-glow">
          <CardHeader>
            <CardTitle className="font-headline text-primary text-glow">Skills Overview</CardTitle>
            <CardDescription>Your current proficiency across key areas.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <SkillRadarChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 card-glow">
          <CardHeader>
            <CardTitle className="font-headline">Career Path Progress</CardTitle>
            <CardDescription>Your journey to becoming a Senior AI Engineer.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <ProgressRings />
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gamified Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-glow text-primary">Level 12</div>
            <p className="text-xs text-muted-foreground">450/1000 XP to next level</p>
            <Progress value={45} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-glow text-primary">15</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 card-glow">
          <CardHeader>
            <CardTitle className="font-headline">Strengths & Weaknesses</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-2">Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {strengths.map(skill => (
                  <Badge key={skill} variant="outline" className="border-green-400/50 text-green-400">{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-400 mb-2">Areas for Improvement</h4>
              <div className="flex flex-wrap gap-2">
                {weaknesses.map(skill => (
                  <Badge key={skill} variant="outline" className="border-amber-400/50 text-amber-400">{skill}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 card-glow flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="text-primary text-glow"/>
              <CardTitle className="font-headline">Next Step</CardTitle>
            </div>
            <CardDescription>
              Based on your goals, we recommend this course.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <h3 className="font-semibold text-primary">Advanced Machine Learning with Python</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Dive deep into ML algorithms and techniques to bridge your skill gap.
            </p>
          </CardContent>
          <CardContent>
            <Button className="w-full button-glow bg-primary text-primary-foreground hover:bg-primary/90">
              View Course
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
