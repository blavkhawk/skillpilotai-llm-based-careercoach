import PageHeader from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { CircleDollarSign, Flame, ShieldCheck } from "lucide-react";
import Image from "next/image";

const leaderboardData = [
  { rank: 1, name: "NeonNinja", xp: 12450, avatarId: "avatar-1" },
  { rank: 2, name: "CyberSamurai", xp: 11800, avatarId: "avatar-2" },
  { rank: 3, name: "GlitchGoddess", xp: 11230, avatarId: "avatar-3" },
  { rank: 4, name: "DataDuke", xp: 10500, avatarId: "avatar-4" },
  { rank: 5, name: "SynthSorcerer", xp: 9800, avatarId: "avatar-5" },
];

const getAvatarUrl = (id: string) => {
    return PlaceHolderImages.find(img => img.id === id)?.imageUrl || `https://picsum.photos/seed/default/100/100`;
}

const RankBadge = ({ rank }: { rank: number }) => {
    let color = "text-yellow-400 border-yellow-400/50";
    if (rank === 2) color = "text-gray-300 border-gray-300/50";
    if (rank === 3) color = "text-orange-400 border-orange-400/50";
    if (rank > 3) color = "text-muted-foreground border-border";

    return (
        <span className={`font-bold text-lg w-8 text-center ${rank <= 3 ? color.split(' ')[0] : 'text-muted-foreground'}`}>{rank}</span>
    )
}

export default function UpskillingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Gamified Upskilling"
        subtitle="Track your progress, earn rewards, and climb the leaderboard."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-glow">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-primary text-glow">Daily Streak</CardTitle>
                <Flame className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">12 Days</div>
                <p className="text-xs text-muted-foreground">Complete a lesson today to keep your streak!</p>
            </CardContent>
        </Card>
        <Card className="card-glow">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-accent text-glow-accent">Rank</CardTitle>
                <ShieldCheck className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">Gold II</div>
                <p className="text-xs text-muted-foreground">Top 15% of all learners</p>
            </CardContent>
        </Card>
        <Card className="card-glow">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline">Coins Earned</CardTitle>
                <CircleDollarSign className="h-6 w-6 text-yellow-400" />
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-yellow-400">3,450</div>
                <p className="text-xs text-muted-foreground">Redeem for profile cosmetics</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card className="card-glow">
                <CardHeader>
                    <CardTitle className="font-headline">Leaderboard</CardTitle>
                    <CardDescription>See how you stack up against other learners.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Rank</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">XP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboardData.map((user) => (
                                <TableRow key={user.rank} className="hover:bg-primary/5">
                                    <TableCell><RankBadge rank={user.rank} /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                                                <AvatarImage src={getAvatarUrl(user.avatarId)} alt={user.name} data-ai-hint="profile person" />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-primary">{user.xp.toLocaleString()} XP</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card className="card-glow">
                 <CardHeader>
                    <CardTitle className="font-headline">Rewards</CardTitle>
                    <CardDescription>Spend your coins on unique profile customizations.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-card-foreground/5 rounded-lg p-2 flex flex-col items-center justify-center text-center border border-border hover:border-accent transition-colors">
                        <Image src="/neon-badge.svg" alt="Neon Badge" width={64} height={64} data-ai-hint="neon badge" />
                        <p className="text-sm font-semibold mt-2">Neon Badge</p>
                        <p className="text-xs text-yellow-400">1,500 Coins</p>
                    </div>
                     <div className="aspect-square bg-card-foreground/5 rounded-lg p-2 flex flex-col items-center justify-center text-center border border-border hover:border-accent transition-colors">
                        <Image src="/animated-border.svg" alt="Animated Border" width={64} height={64} data-ai-hint="animated frame" />
                        <p className="text-sm font-semibold mt-2">Animated Border</p>
                        <p className="text-xs text-yellow-400">3,000 Coins</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
