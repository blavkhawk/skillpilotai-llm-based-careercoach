"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { subject: "Frontend", A: 110, fullMark: 150 },
  { subject: "Backend", A: 98, fullMark: 150 },
  { subject: "AI/ML", A: 86, fullMark: 150 },
  { subject: "Design", A: 99, fullMark: 150 },
  { subject: "DevOps", A: 85, fullMark: 150 },
  { subject: "System Design", A: 120, fullMark: 150 },
]

export default function SkillRadarChart() {
  return (
    <ChartContainer config={{}} className="mx-auto aspect-square h-[350px]">
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <defs>
              <radialGradient id="skillRadarGradient">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </radialGradient>
          </defs>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="hsl(var(--primary))"
            fill="url(#skillRadarGradient)"
            fillOpacity={0.8}
            strokeWidth={2}
          />
          <Tooltip cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
