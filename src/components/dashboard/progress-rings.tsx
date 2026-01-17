const ProgressRing = ({
  radius,
  stroke,
  progress,
  color,
  label,
  value,
}: {
  radius: number;
  stroke: number;
  progress: number;
  color: string;
  label: string;
  value: string;
}) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="hsl(var(--border))"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset, strokeLinecap: "round" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-lg" style={{ color }}>{value}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

export default function ProgressRings() {
  return (
    <div className="flex justify-around items-center">
      <ProgressRing
        radius={50}
        stroke={6}
        progress={75}
        color="hsl(var(--primary))"
        label="Courses"
        value="3/4"
      />
      <ProgressRing
        radius={50}
        stroke={6}
        progress={50}
        color="hsl(var(--accent))"
        label="Projects"
        value="2/4"
      />
      <ProgressRing
        radius={50}
        stroke={6}
        progress={90}
        color="hsl(var(--chart-3))"
        label="Assessments"
        value="9/10"
      />
    </div>
  );
}
