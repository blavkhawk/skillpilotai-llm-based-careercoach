"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Bot,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Trophy,
  Users,
} from "lucide-react";
import Logo from "@/components/logo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/assessments", icon: ClipboardCheck, label: "Assessments" },
  { href: "/career-path", icon: GraduationCap, label: "Career Path" },
  { href: "/courses", icon: Lightbulb, label: "Courses" },
  { href: "/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/projects", icon: Users, label: "Projects" },
  { href: "/assistant", icon: Bot, label: "Assistant" },
  { href: "/upskilling", icon: Trophy, label: "Upskilling" },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-4 bg-card/50 backdrop-blur-xl border-r border-border z-10">
      <Link href="/dashboard" className="mb-8">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor: 'hsl(var(--accent))', stopOpacity:1}} />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="url(#grad1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
            <path d="M2 7L12 12L22 7" stroke="url(#grad1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
            <path d="M12 22V12" stroke="url(#grad1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
        </svg>
      </Link>
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 flex-grow">
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center h-12 w-12 rounded-lg transition-colors duration-300",
                    pathname === item.href
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border-primary/20 text-foreground">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
      <div className="mt-auto">
        <Avatar className="h-10 w-10 border-2 border-primary/50 hover:border-primary transition-colors">
            <AvatarImage src="https://picsum.photos/seed/a/100/100" alt="User" data-ai-hint="profile person" />
            <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </aside>
  );
}
