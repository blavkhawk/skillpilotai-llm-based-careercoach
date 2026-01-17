"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/page-header";
import { Upload, FileText, Loader, CheckCircle2, AlertCircle, Sparkles, Brain, Trophy, Target, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeResume } from "@/ai/flows/resume-analysis";
import type { ResumeAnalysisOutput } from "@/ai/flows/resume-analysis";
import { generateQuiz, generateFeedback } from "@/ai/flows/skill-assessment";
import type { QuizOutput, AssessmentFeedback } from "@/ai/flows/skill-assessment";
import { useToast } from "@/hooks/use-toast";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export default function AssessmentsPage() {
  // Resume Analysis State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisOutput | null>(null);
  const [userName, setUserName] = useState("");
  const [jobField, setJobField] = useState("");
  const [skills, setSkills] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Skill Quiz State
  const [quizSkill, setQuizSkill] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quiz, setQuiz] = useState<QuizOutput | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [feedback, setFeedback] = useState<AssessmentFeedback | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please upload a resume file first.",
      });
      return;
    }

    setUploading(true);

    try {
      // Step 1: Parse the file
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📤 Uploading file:', file.name);
      const parseRes = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!parseRes.ok) {
        const errorData = await parseRes.json();
        throw new Error(errorData.error || 'Failed to parse resume');
      }

      const { text: resumeText } = await parseRes.json();
      console.log('✅ Resume parsed, text length:', resumeText.length);
      
      setUploading(false);
      setAnalyzing(true);

      // Step 2: Analyze with AI
      console.log('🤖 Starting AI analysis...');
      const analysis = await analyzeResume({
        resumeText,
        userName: userName || undefined,
        jobField: jobField || undefined,
        skills: skills || undefined,
      });

      console.log('✅ Analysis complete:', analysis);
      setResult(analysis);
      setAnalyzing(false);
      
      toast({
        title: "Analysis Complete!",
        description: "Your resume has been analyzed successfully.",
      });
    } catch (error) {
      console.error('❌ Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
      setUploading(false);
      setAnalyzing(false);
    }
  };

  // Quiz Handler Functions
  const handleStartQuiz = async () => {
    if (!quizSkill.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a skill to assess.",
      });
      return;
    }

    setGeneratingQuiz(true);
    try {
      const quizData = await generateQuiz({
        skill: quizSkill,
        difficulty: quizDifficulty,
        questionCount: 10,
      });
      setQuiz(quizData);
      setCurrentQuestion(0);
      setUserAnswers([]);
      setShowExplanation(false);
      setQuizCompleted(false);
      setFeedback(null);
      toast({
        title: "Quiz Ready!",
        description: `10 ${quizDifficulty} questions on ${quizSkill}`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to Generate Quiz",
        description: "Please try again.",
      });
    }
    setGeneratingQuiz(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (showExplanation) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      // Quiz completed
      handleCompleteQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(userAnswers[currentQuestion - 1] !== undefined);
    }
  };

  const handleCompleteQuiz = async () => {
    if (!quiz) return;
    
    setQuizCompleted(true);
    setGeneratingFeedback(true);

    const correctAnswers = userAnswers.filter(
      (answer, index) => answer === quiz.questions[index].correctAnswer
    ).length;

    const incorrectCategories = quiz.questions
      .filter((q, index) => userAnswers[index] !== q.correctAnswer)
      .map(q => q.category);

    try {
      const feedbackData = await generateFeedback({
        skill: quiz.skill,
        difficulty: quiz.difficulty,
        totalQuestions: quiz.questions.length,
        correctAnswers,
        incorrectCategories,
      });
      setFeedback(feedbackData);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to Generate Feedback",
        description: "Results shown without detailed feedback.",
      });
    }
    setGeneratingFeedback(false);
  };

  const chartData = result
    ? Object.entries(result.category_scores).map(([key, value]) => ({
        category: key,
        score: value,
      }))
    : [];

  const progress = quiz ? ((currentQuestion + 1) / quiz.questions.length) * 100 : 0;
  const correctCount = quiz ? userAnswers.filter((answer, index) => answer === quiz.questions[index].correctAnswer).length : 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Skills Assessment Center"
        subtitle="Test your skills with AI-powered quizzes and resume analysis"
      />

      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="quiz" className="gap-2">
            <Brain className="h-4 w-4" />
            Skill Quiz
          </TabsTrigger>
          <TabsTrigger value="resume" className="gap-2">
            <FileText className="h-4 w-4" />
            Resume Analysis
          </TabsTrigger>
        </TabsList>

        {/* SKILL QUIZ TAB */}
        <TabsContent value="quiz" className="mt-6">
          {!quiz ? (
            /* Quiz Setup */
            <Card className="card-glow max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Target className="text-primary" />
                  Start Skill Assessment
                </CardTitle>
                <CardDescription>
                  Test your knowledge with an AI-generated quiz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-skill">Skill to Assess *</Label>
                  <Input
                    id="quiz-skill"
                    placeholder="e.g., JavaScript, Python, React, Data Structures"
                    value={quizSkill}
                    onChange={(e) => setQuizSkill(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={quizDifficulty} onValueChange={(value: any) => setQuizDifficulty(value)}>
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full button-glow bg-primary"
                  onClick={handleStartQuiz}
                  disabled={generatingQuiz}
                >
                  {generatingQuiz ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Start Quiz (10 Questions)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : !quizCompleted ? (
            /* Quiz Questions */
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Progress */}
              <Card className="card-glow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Question {currentQuestion + 1} of {quiz.questions.length}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {correctCount} correct
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </CardContent>
              </Card>

              {/* Question Card */}
              <Card className="card-glow">
                <CardHeader>
                  <CardDescription className="uppercase text-xs font-semibold text-primary">
                    {quiz.questions[currentQuestion].category}
                  </CardDescription>
                  <CardTitle className="text-lg leading-relaxed">
                    {quiz.questions[currentQuestion].question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quiz.questions[currentQuestion].options.map((option, index) => {
                    const isSelected = userAnswers[currentQuestion] === index;
                    const isCorrect = index === quiz.questions[currentQuestion].correctAnswer;
                    const showResult = showExplanation;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={showExplanation}
                        className={cn(
                          "w-full text-left p-4 rounded-lg border-2 transition-all",
                          "hover:border-primary/50",
                          !showResult && "hover:bg-primary/5",
                          isSelected && !showResult && "border-primary bg-primary/10",
                          showResult && isCorrect && "border-green-500 bg-green-500/10",
                          showResult && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                          showResult && !isSelected && !isCorrect && "opacity-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold",
                            isSelected && !showResult && "border-primary text-primary",
                            showResult && isCorrect && "border-green-500 text-green-500 bg-green-500/20",
                            showResult && isSelected && !isCorrect && "border-red-500 text-red-500 bg-red-500/20"
                          )}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="flex-1">{option}</span>
                          {showResult && isCorrect && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {/* Explanation */}
                  {showExplanation && (
                    <Card className="bg-muted/50 border-primary/30">
                      <CardContent className="p-4">
                        <p className="text-sm font-semibold mb-2 text-primary">Explanation:</p>
                        <p className="text-sm text-muted-foreground">
                          {quiz.questions[currentQuestion].explanation}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
                <CardContent className="flex justify-between pt-0">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!showExplanation}
                    className="button-glow"
                  >
                    {currentQuestion === quiz.questions.length - 1 ? (
                      <>
                        <Trophy className="mr-2 h-4 w-4" />
                        Finish Quiz
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Quiz Results */
            <div className="max-w-4xl mx-auto space-y-6">
              {generatingFeedback ? (
                <Card className="card-glow">
                  <CardContent className="p-12 text-center">
                    <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg font-semibold">Analyzing your performance...</p>
                  </CardContent>
                </Card>
              ) : feedback ? (
                <>
                  {/* Score Card */}
                  <Card className={cn(
                    "card-glow border-2",
                    feedback.passed ? "border-green-500" : "border-red-500"
                  )}>
                    <CardContent className="p-8 text-center">
                      <Trophy className={cn(
                        "h-16 w-16 mx-auto mb-4",
                        feedback.passed ? "text-green-500" : "text-red-500"
                      )} />
                      <h2 className="text-4xl font-bold mb-2">{feedback.overallScore}%</h2>
                      <p className="text-xl text-muted-foreground mb-4">
                        {correctCount} out of {quiz.questions.length} correct
                      </p>
                      <div className={cn(
                        "inline-block px-4 py-2 rounded-full text-sm font-semibold",
                        feedback.passed ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                      )}>
                        {feedback.passed ? "Passed!" : "Keep Practicing"}
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Skill Level: <span className="font-semibold text-foreground capitalize">{feedback.level}</span>
                      </p>
                    </CardContent>
                  </Card>

                  {/* Strengths & Weaknesses */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="card-glow border-green-500/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="text-green-500" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {feedback.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="card-glow border-red-500/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="text-red-500" />
                          Areas to Improve
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {feedback.weaknesses.map((weakness, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              <span className="text-sm">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommendations */}
                  <Card className="card-glow">
                    <CardHeader>
                      <CardTitle>Learning Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {feedback.recommendations.map((rec, idx) => (
                        <div key={idx} className="border-l-2 border-primary pl-4">
                          <h4 className="font-semibold mb-1">{rec.topic}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                          <div className="flex flex-wrap gap-2">
                            {rec.resources.map((resource, ridx) => (
                              <span key={ridx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {resource}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Next Steps */}
                  <Card className="card-glow">
                    <CardHeader>
                      <CardTitle>Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feedback.nextSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                              {idx + 1}
                            </span>
                            <span className="text-sm flex-1">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuiz(null);
                      setQuizSkill("");
                      setQuizCompleted(false);
                      setFeedback(null);
                    }}
                    className="w-full border-primary/30"
                  >
                    Take Another Quiz
                  </Button>
                </>
              ) : null}
            </div>
          )}
        </TabsContent>

        {/* RESUME ANALYSIS TAB */}
        <TabsContent value="resume" className="mt-6">
          {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Upload className="text-primary" size={24} />
                <span>Upload Resume</span>
              </CardTitle>
              <CardDescription>
                Upload your resume in DOCX or TXT format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer",
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50",
                  file && "bg-primary/5 border-primary/30"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Drag & drop your resume here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Sparkles className="text-accent" size={24} />
                <span>Additional Info (Optional)</span>
              </CardTitle>
              <CardDescription>
                Help us provide more personalized insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field">Field of Interest</Label>
                <Input
                  id="field"
                  placeholder="e.g., Data Science, Frontend Development"
                  value={jobField}
                  onChange={(e) => setJobField(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Your Skills</Label>
                <Input
                  id="skills"
                  placeholder="React, Python, AWS (comma-separated)"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <Button
                className="w-full button-glow bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
                onClick={handleAnalyze}
                disabled={!file || uploading || analyzing}
              >
                {uploading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Parsing Resume...
                  </>
                ) : analyzing ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Skills...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Score */}
            <Card className="bg-gradient-to-br from-primary/20 to-accent/10 border-primary/50 card-glow">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Overall Skill Index</p>
                <div className="relative inline-block">
                  <div className="text-6xl font-bold text-primary text-glow">
                    {result.overall_skill_index}
                  </div>
                  <span className="text-2xl text-primary/70">/100</span>
                </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card className="lg:col-span-2 card-glow">
              <CardHeader>
                <CardTitle className="font-headline">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="font-headline">Skill Breakdown</CardTitle>
              <CardDescription>Your scores across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="hsl(var(--primary) / 0.2)" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar
                    name="Skills"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-glow border-primary/30">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <CheckCircle2 className="text-primary" />
                  <span>Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm text-muted-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow border-accent/30">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <AlertCircle className="text-accent" />
                  <span>Areas for Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span className="text-sm text-muted-foreground">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Button
            variant="outline"
            className="w-full md:w-auto border-primary/30 hover:bg-primary/10 hover:text-primary"
            onClick={() => {
              setResult(null);
              setFile(null);
              setUserName("");
              setJobField("");
              setSkills("");
            }}
          >
            Analyze Another Resume
          </Button>
        </div>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
