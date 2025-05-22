"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Target, TrendingUp, AlertTriangle, Star } from "lucide-react";
import Link from "next/link";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart" // ShadCN charts
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell } from "recharts"

const chartData = [
  { month: "Jan", score: Math.floor(Math.random() * 30) + 50 },
  { month: "Feb", score: Math.floor(Math.random() * 30) + 55 },
  { month: "Mar", score: Math.floor(Math.random() * 30) + 60 },
  { month: "Apr", score: Math.floor(Math.random() * 30) + 65 },
  { month: "May", score: Math.floor(Math.random() * 30) + 70 },
  { month: "Jun", score: Math.floor(Math.random() * 30) + 75 },
]

const chartConfig = {
  score: {
    label: "Average Score",
    color: "hsl(var(--primary))",
  },
} satisfies Parameters<typeof ChartContainer>[0]["config"]

const pieData = [
    { name: 'Kinematics', value: 400, fill: 'hsl(var(--chart-1))' },
    { name: 'Dynamics', value: 300, fill: 'hsl(var(--chart-2))' },
    { name: 'Optics', value: 300, fill: 'hsl(var(--chart-3))' },
    { name: 'Thermodynamics', value: 200, fill: 'hsl(var(--chart-4))' },
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
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">10 daily, 32 topic-wise</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 Days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Score Trends</CardTitle>
            <CardDescription>Your average quiz scores over the past few months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive"/>Weak Areas</CardTitle>
            <CardDescription>Topics where you might need more practice.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={{}} className="h-[200px] w-full aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label >
                         {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                     <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
             <ul className="mt-4 list-disc list-inside text-sm text-muted-foreground space-y-1 text-left w-full">
              <li>Optics (Average: 60%)</li>
              <li>Thermodynamics (Average: 65%)</li>
             </ul>
          </CardContent>
        </Card>
      </div>
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
