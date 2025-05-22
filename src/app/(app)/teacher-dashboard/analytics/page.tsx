"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingDown, TrendingUp, UserCheck, Percent } from "lucide-react";
import Link from "next/link";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STUDY_GRADES } from "@/lib/constants";

const overallPerformanceData = [
  { name: 'Grade 9', avgScore: 75, color: "hsl(var(--chart-1))" },
  { name: 'Grade 10', avgScore: 82, color: "hsl(var(--chart-2))" },
  { name: 'Grade 11', avgScore: 70, color: "hsl(var(--chart-3))" },
  { name: 'Grade 12', avgScore: 88, color: "hsl(var(--chart-4))" },
];

const topicDifficultyData = [
  { topic: 'Kinematics', correct: 60, incorrect: 40, color: "hsl(var(--chart-1))" },
  { topic: 'Optics', correct: 55, incorrect: 45, color: "hsl(var(--chart-2))" },
  { topic: 'Electromagnetism', correct: 70, incorrect: 30, color: "hsl(var(--chart-3))" },
  { topic: 'Thermodynamics', correct: 50, incorrect: 50, color: "hsl(var(--chart-4))" },
];

const chartConfigOverall = {
  avgScore: { label: "Avg. Score (%)", color: "hsl(var(--primary))" },
} satisfies Parameters<typeof ChartContainer>[0]["config"];

const chartConfigTopics = {
  correct: { label: "Correct", color: "hsl(var(--chart-1))" },
  incorrect: { label: "Incorrect", color: "hsl(var(--destructive))" }, // Use destructive for incorrect
} satisfies Parameters<typeof ChartContainer>[0]["config"];


export default function TeacherAnalyticsPage() {
  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/teacher-dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teacher Dashboard
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2"><BarChart3 className="h-7 w-7 text-primary"/>Student Analytics</CardTitle>
          <CardDescription>View overall student performance, quiz results, and identify common weak areas across different grades and topics.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1"><UserCheck className="h-4 w-4"/>Active Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">125</p>
                        <p className="text-xs text-muted-foreground">+10 since last week</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1"><Percent className="h-4 w-4"/>Overall Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">78.5%</p>
                        <p className="text-xs text-muted-foreground">Across all grades</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1"><TrendingUp className="h-4 w-4"/>Most Improved Class</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">Grade 10</p>
                        <p className="text-xs text-muted-foreground">+8% average score</p>
                    </CardContent>
                </Card>
            </div>
             <div className="mb-6">
                <Select>
                    <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Filter by Grade (e.g., Grade 9)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectLabel>Grades</SelectLabel>
                        <SelectItem value="all">All Grades</SelectItem>
                        {STUDY_GRADES.map(grade => (
                            <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                        ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance by Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigOverall} className="h-[300px] w-full">
                  <BarChart data={overallPerformanceData} layout="vertical" margin={{left:10, right: 30}}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" dataKey="avgScore" domain={[0,100]} tickFormatter={(value) => `${value}%`}/>
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="avgScore" radius={5}>
                        {overallPerformanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Topic Difficulty (All Grades)</CardTitle>
                 <CardDescription>Percentage of correct vs. incorrect answers by topic.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigTopics} className="h-[300px] w-full">
                  <BarChart data={topicDifficultyData} layout="horizontal" barCategoryGap={10} stackOffset="expand">
                    <CartesianGrid vertical={false} />
                    <XAxis type="category" dataKey="topic" tickLine={false} axisLine={false} />
                    <YAxis type="number" tickFormatter={(value) => `${Math.round(value * 100)}%`} domain={[0,1]}/>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="correct" stackId="a" fill="var(--color-correct)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="incorrect" stackId="a" fill="var(--color-incorrect)" radius={[4, 0, 0, 4]}/>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
