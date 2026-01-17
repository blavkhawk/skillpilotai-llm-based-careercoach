'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/logo";
import { Loader } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-4 neon-grid">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.1),rgba(255,255,255,0))]"></div>
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm card-glow border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="font-headline text-3xl text-glow">
            Welcome to Neon Ascent
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your AI-powered copilot for career growth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button asChild className="w-full button-glow bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/auth">
                Get Started
              </Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Join thousands of professionals advancing their careers with AI
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
