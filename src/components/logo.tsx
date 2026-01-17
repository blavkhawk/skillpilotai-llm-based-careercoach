import { cn } from "@/lib/utils";

const Logo = ({ className }: { className?: string }) => (
  <h1 className={cn("font-headline text-3xl font-bold text-primary", className)}>
    <span
      className="text-glow"
      style={{
        textShadow:
          "0 0 4px hsl(var(--primary)), 0 0 8px hsl(var(--primary)), 0 0 12px hsl(var(--primary))",
      }}
    >
      SkillPilotAI
    </span>
  </h1>
);

export default Logo;
