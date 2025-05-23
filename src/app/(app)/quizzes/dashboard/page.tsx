
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Target, TrendingUp, AlertTriangle, Star, BookOpen, Brain } from "lucide-react";
import Link from "next/link";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell } from "recharts"

const progressOverTimeData = [
  { month: "Jan", score: Math.floor(Math.random() * 20) + 60 },
  { month: "Feb", score: Math.floor(Math.random() * 20) + 65 },
  { month: "Mar", score: Math.floor(Math.random() * 15) + 70 },
  { month: "Apr", score: Math.floor(Math.random() * 20) + 68 },
  { month: "May", score: Math.floor(Math.random() * 25) + 70 },
  { month: "Jun", score: Math.floor(Math.random() * 20) + 75 },
]

const progressOverTimeConfig = {
  score: {
    label: "Average Score",
    color: "hsl(var(--primary))",
  },
} satisfies Parameters<typeof ChartContainer>[0]["config"]

const topicPerformanceData = [
    { name: 'Kinematics', value: 75, fill: 'hsl(var(--chart-1))' },
    { name: 'Dynamics', value: 85, fill: 'hsl(var(--chart-2))' },
    { name: 'Optics', value: 60, fill: 'hsl(var(--chart-3))' },
    { name: 'Thermodynamics', value: 70, fill: 'hsl(var(--chart-4))' },
    { name: 'Electromagnetism', value: 80, fill: 'hsl(var(--chart-5))' },
];


export default function QuizDashboardPage() {
  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/quizzes">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Performance Dashboard</CardTitle>
          <CardDescription>Track your quiz performance, identify weak areas, and see your progress over time.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+5% from last month (mock)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">10 daily, 32 topic-wise (mock)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 Days</div>
            <p className="text-xs text-muted-foreground">Keep it up! (mock)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Progress Over Time</CardTitle>
            <CardDescription>Your average quiz scores over the past few months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={progressOverTimeConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={progressOverTimeData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis domain={[50, 100]} tickFormatter={(value) => `${value}%`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive"/>Topic Performance (Weak Areas)</CardTitle>
            <CardDescription>Distribution of performance across different topics.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={{}} className="h-[200px] w-full aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={topicPerformanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`} >
                         {topicPerformanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                     <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
             <ul className="mt-4 list-disc list-inside text-sm text-muted-foreground space-y-1 text-left w-full">
              {topicPerformanceData.filter(t => t.value < 70).map(t => (
                <li key={t.name}>{t.name} (Average: {t.value}%) - Needs Improvement</li>
              ))}
             </ul>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-green-500"/>Topic Mastery Overview</CardTitle>
            <CardDescription>Your estimated mastery level for key physics topics based on quiz scores.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={{ score: { label: "Mastery Score", color: "hsl(var(--chart-2))" } }} className="h-[300px] w-full">
                <BarChart data={topicPerformanceData} layout="vertical">
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" dataKey="value" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="name" type="category" width={120} tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="value" name="Mastery Score" radius={4}>
                        {topicPerformanceData.map((entry) => (
                            <Cell key={`cell-mastery-${entry.name}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>

       <Card>
          <CardHeader>
            <CardTitle>Gamification (Coming Soon)</CardTitle>
            <CardDescription>Earn XP, unlock badges, and climb leaderboards!</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This section will be updated with gamified elements in future versions.</p>
          </CardContent>
        </Card>
    </div>
  );
}
