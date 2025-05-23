
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, BarChart3, TrendingDown, TrendingUp, UserCheck, Percent, AlertTriangle, Loader2, BookOpen, CheckCircle, Clock } from "lucide-react";
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
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import type { StudyGrade } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";


const overallPerformanceData = [
  { name: 'Grade 9', avgScore: 75, color: "hsl(var(--chart-1))" },
  { name: 'Grade 10', avgScore: 82, color: "hsl(var(--chart-2))" },
  { name: 'Grade 11', avgScore: 70, color: "hsl(var(--chart-3))" },
  { name: 'Grade 12', avgScore: 88, color: "hsl(var(--chart-4))" },
];

const quizPerformanceByTopicData = [
  { topic: 'Kinematics', correct: 60, incorrect: 40, colorCorrect: "hsl(var(--chart-1))", colorIncorrect: "hsl(var(--destructive))" },
  { topic: 'Optics', correct: 55, incorrect: 45, colorCorrect: "hsl(var(--chart-2))", colorIncorrect: "hsl(var(--destructive))"},
  { topic: 'Electromagnetism', correct: 70, incorrect: 30, colorCorrect: "hsl(var(--chart-3))", colorIncorrect: "hsl(var(--destructive))"},
  { topic: 'Thermodynamics', correct: 50, incorrect: 50, colorCorrect: "hsl(var(--chart-4))", colorIncorrect: "hsl(var(--destructive))"},
];

const mockStudentData = [
    { id: "s001", name: "Ahmed Ali", grade: "Grade 9", averageQuizScore: 85, lastActiveFeature: "Simulations (Projectile Motion)", avatar: "https://placehold.co/40x40.png?text=AA", strengths: ["Kinematics", "Dynamics"], weaknesses: ["Optics"], quizzesCompleted: 12, timeSpentInApp: "18h 45m", lastQuizTimestamp: "2024-05-21" },
    { id: "s002", name: "Fatima Khan", grade: "Grade 10", averageQuizScore: 72, lastActiveFeature: "Study Material (Electromagnetism)", avatar: "https://placehold.co/40x40.png?text=FK", strengths: ["Electromagnetism"], weaknesses: ["Thermodynamics", "Optics"], quizzesCompleted: 8, timeSpentInApp: "12h 15m", lastQuizTimestamp: "2024-05-19" },
    { id: "s003", name: "Bilal Hassan", grade: "Grade 9", averageQuizScore: 91, lastActiveFeature: "Quizzes (Daily Challenge)", avatar: "https://placehold.co/40x40.png?text=BH", strengths: ["All Topics"], weaknesses: ["None apparent"], quizzesCompleted: 15, timeSpentInApp: "22h 00m", lastQuizTimestamp: "2024-05-22" },
    { id: "s004", name: "Aisha Rao", grade: "Grade 11", averageQuizScore: 68, lastActiveFeature: "Learn with AI", avatar: "https://placehold.co/40x40.png?text=AR", strengths: ["Capacitors"], weaknesses: ["Projectile Motion", "SHM"], quizzesCompleted: 5, timeSpentInApp: "9h 30m", lastQuizTimestamp: "2024-05-15" },
    { id: "s005", name: "Usman Tariq", grade: "Grade 12", averageQuizScore: 78, lastActiveFeature: "Simulations (States of Matter)", avatar: "https://placehold.co/40x40.png?text=UT", strengths: ["Thermodynamics", "Modern Physics"], weaknesses: ["AC Circuits"], quizzesCompleted: 10, timeSpentInApp: "16h 50m", lastQuizTimestamp: "2024-05-20" },
];

const mockFeatureUsageData = [
    { name: 'Simulations', value: 400, fill: 'hsl(var(--chart-1))' },
    { name: 'Study Material', value: 300, fill: 'hsl(var(--chart-2))' },
    { name: 'Quizzes', value: 200, fill: 'hsl(var(--chart-3))' },
    { name: 'Learn with AI', value: 100, fill: 'hsl(var(--chart-4))' },
    { name: 'Mind Maps', value: 50, fill: 'hsl(var(--chart-5))' },
];

const mockChapterViewData = [
    { chapter: 'Kinematics (G9)', views: 150, color: "hsl(var(--chart-1))" },
    { chapter: 'Electromagnetism (G10)', views: 120, color: "hsl(var(--chart-2))" },
    { chapter: 'Measurements (G11)', views: 90, color: "hsl(var(--chart-3))" },
    { chapter: 'Thermodynamics (G12)', views: 75, color: "hsl(var(--chart-4))" },
    { chapter: 'Optics (G10)', views: 110, color: "hsl(var(--chart-5))" },
];

const quizEngagementData = [
    { name: 'Daily Quizzes', attempts: 150, avgScore: 78, color: "hsl(var(--chart-1))" },
    { name: 'Topic: Kinematics', attempts: 80, avgScore: 72, color: "hsl(var(--chart-2))" },
    { name: 'Topic: Optics', attempts: 65, avgScore: 65, color: "hsl(var(--chart-3))" },
    { name: 'Topic: Electromagnetism', attempts: 95, avgScore: 85, color: "hsl(var(--chart-4))" },
];

const challengingConceptsData = [
    { id: 'c1', concept: "Applying Newton's Third Law in complex scenarios.", topic: "Dynamics", incorrectPercentage: 45, gradeLevel: "Grade 9" },
    { id: 'c2', concept: "Distinguishing between series and parallel capacitor configurations.", topic: "Capacitors", incorrectPercentage: 38, gradeLevel: "Grade 11" },
    { id: 'c3', concept: "Calculating range in projectile motion with initial height.", topic: "Projectile Motion", incorrectPercentage: 52, gradeLevel: "Grade 11" },
    { id: 'c4', concept: "Understanding the direction of induced current (Lenz's Law).", topic: "Electromagnetism", incorrectPercentage: 40, gradeLevel: "Grade 10" },
    { id: 'c5', concept: "Interpreting V-t graphs for non-uniform acceleration.", topic: "Kinematics", incorrectPercentage: 48, gradeLevel: "Grade 9" },
];


const chartConfigOverall = {
  avgScore: { label: "Avg. Score (%)", color: "hsl(var(--primary))" },
} satisfies Parameters<typeof ChartContainer>[0]["config"];

const chartConfigTopics = {
  correct: { label: "Correct", color: "hsl(var(--chart-1))" },
  incorrect: { label: "Incorrect", color: "hsl(var(--destructive))" },
} satisfies Parameters<typeof ChartContainer>[0]["config"];

const chartConfigEngagement = {
    attempts: { label: "Attempts", color: "hsl(var(--chart-1))" },
    avgScore: { label: "Avg. Score (%)", color: "hsl(var(--chart-2))" }
}


export default function TeacherAnalyticsPage() {
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchGradesForFilter() {
      setIsLoadingGrades(true);
      setGradesError(null);
      try {
        const res = await fetch('/api/study-materials');
        if (!res.ok) {
          throw new Error(`Failed to fetch study grades: ${res.status}`);
        }
        const data: StudyGrade[] = await res.json();
        setStudyGrades(data);
      } catch (error) {
        console.error("Error fetching study grades for filter:", error);
        setGradesError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setIsLoadingGrades(false);
      }
    }
    fetchGradesForFilter();
  }, []);

  // Filtered student data based on selectedGradeFilter
  const filteredStudentData = mockStudentData.filter(student => 
    selectedGradeFilter === "all" || studyGrades.find(sg => sg.id === selectedGradeFilter)?.name === student.grade
  );


  return (
    <div className="space-y-8">
      <Button variant="outline" asChild size="sm">
        <Link href="/teacher-dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teacher Dashboard
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2"><BarChart3 className="h-7 w-7 text-primary"/>Student Analytics Dashboard</CardTitle>
          <CardDescription>View overall student performance, quiz results, app usage, and identify common weak areas across different grades and topics.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1"><UserCheck className="h-4 w-4"/>Active Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{mockStudentData.length}</p>
                        <p className="text-xs text-muted-foreground">+2 since last week (mock)</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1"><Percent className="h-4 w-4"/>Overall Average Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {(mockStudentData.reduce((acc, s) => acc + s.averageQuizScore, 0) / mockStudentData.length || 0).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Across all grades</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500"/>Total Quizzes Taken</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                             {mockStudentData.reduce((acc, s) => acc + s.quizzesCompleted, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">By all students</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1"><Clock className="h-4 w-4 text-blue-500"/>Avg. Time in App</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">~15h 20m</p> {/* This would be calculated in a real scenario */}
                        <p className="text-xs text-muted-foreground">Per active student (mock)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Grade Filter */}
             <div className="mb-6">
                {isLoadingGrades && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading grade filters...</span>
                  </div>
                )}
                {gradesError && !isLoadingGrades && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Grades</AlertTitle>
                    <AlertDescription>{gradesError}. The grade filter might not be complete.</AlertDescription>
                  </Alert>
                )}
                {!isLoadingGrades && (
                  <Select value={selectedGradeFilter} onValueChange={setSelectedGradeFilter}>
                      <SelectTrigger className="w-full md:w-[280px]">
                          <SelectValue placeholder="Filter by Grade (e.g., Grade 9)" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectGroup>
                          <SelectLabel>Grades</SelectLabel>
                          <SelectItem value="all">All Grades</SelectItem>
                          {studyGrades.map(grade => (
                              <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                          ))}
                          {studyGrades.length === 0 && !gradesError && (
                            <SelectItem value="no-grades" disabled>No grades found</SelectItem>
                          )}
                          </SelectGroup>
                      </SelectContent>
                  </Select>
                )}
            </div>

          {/* Charts Grid 1 */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 mb-6">
            <Card className="xl:col-span-1">
              <CardHeader>
                <CardTitle>Overall Performance by Grade</CardTitle>
                <CardDescription>Average quiz scores for each grade level.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigOverall} className="h-[300px] w-full">
                  <BarChart data={overallPerformanceData} layout="vertical" margin={{left:10, right: 30}}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" dataKey="avgScore" domain={[0,100]} tickFormatter={(value) => `${value}%`}/>
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
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
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Quiz Performance by Topic (All Grades)</CardTitle>
                 <CardDescription>Percentage of correct vs. incorrect answers by topic.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigTopics} className="h-[300px] w-full">
                  <BarChart data={quizPerformanceByTopicData} layout="horizontal" barCategoryGap={10} stackOffset="expand">
                    <CartesianGrid vertical={false} />
                    <XAxis type="category" dataKey="topic" tickLine={false} axisLine={false} />
                    <YAxis type="number" tickFormatter={(value) => `${Math.round(value * 100)}%`} domain={[0,1]}/>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="correct" stackId="a" fill="var(--color-correct)" radius={[0, 4, 4, 0]} name="Correct" />
                    <Bar dataKey="incorrect" stackId="a" fill="var(--color-incorrect)" radius={[4, 0, 0, 4]} name="Incorrect"/>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid 2 */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 mb-6">
            <Card className="xl:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-1"><BookOpen className="h-5 w-5 text-blue-500"/>Most Viewed Study Chapters</CardTitle>
                     <CardDescription>Identifies chapters students are engaging with most.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{ views: { label: "Views", color: "hsl(var(--chart-3))" } }} className="h-[250px] w-full">
                        <BarChart data={mockChapterViewData} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" dataKey="views" />
                            <YAxis dataKey="chapter" type="category" tickLine={false} axisLine={false} width={120} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="views" radius={4}>
                                {mockChapterViewData.map((entry, index) => (
                                    <Cell key={`cell-views-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card className="xl:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-1"><TrendingUp className="h-5 w-5 text-green-500"/>Overall App Feature Usage</CardTitle>
                    <CardDescription>Breakdown of how students are using different app sections.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={mockFeatureUsageData} dataKey="value" nameKey="name" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} >
                                {mockFeatureUsageData.map((entry, index) => (
                                    <Cell key={`cell-feature-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} className="text-xs [&_button]:p-0 [&_button]:text-xs" />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="xl:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-1"><CheckCircle className="h-5 w-5 text-indigo-500"/>Quiz Engagement</CardTitle>
                    <CardDescription>Attempts and average scores for different quiz categories.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigEngagement} className="h-[250px] w-full">
                        <BarChart data={quizEngagementData} margin={{ left: -20, right: 5 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickFormatter={(value) => value.split(':')[0]} />
                            <YAxis yAxisId="left" dataKey="attempts" stroke="hsl(var(--chart-1))" name="Attempts"/>
                            <YAxis yAxisId="right" dataKey="avgScore" orientation="right" stroke="hsl(var(--chart-2))" domain={[0,100]} tickFormatter={(v) => `${v}%`} name="Avg. Score" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar yAxisId="left" dataKey="attempts" fill="var(--color-attempts)" radius={4} name="Attempts" />
                            <Bar yAxisId="right" dataKey="avgScore" fill="var(--color-avgScore)" radius={4} name="Avg. Score (%)" />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
          </div>

          {/* Commonly Challenging Concepts Table */}
          <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive"/>Commonly Challenging Concepts</CardTitle>
                <CardDescription>Based on aggregated incorrect quiz answers (mock data). Helps identify topics needing more focus.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Concept/Question Snippet</TableHead>
                            <TableHead>Related Topic</TableHead>
                            <TableHead>Affected Grade (Mock)</TableHead>
                            <TableHead className="text-right">Incorrect Attempts (%)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {challengingConceptsData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium max-w-xs truncate">{item.concept}</TableCell>
                                <TableCell><Badge variant="outline">{item.topic}</Badge></TableCell>
                                <TableCell>{item.gradeLevel}</TableCell>
                                <TableCell className="text-right text-destructive font-semibold">{item.incorrectPercentage}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

          {/* Detailed Student Performance Table */}
          <Card>
            <CardHeader>
                <CardTitle>Detailed Student Performance</CardTitle>
                <CardDescription>Individual student statistics to identify progress and areas needing attention. Filter by grade above.</CardDescription>
            </CardHeader>
            <CardContent>
                {filteredStudentData.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Avatar</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Avg. Score</TableHead>
                                <TableHead>Quizzes Done</TableHead>
                                <TableHead>Time in App</TableHead>
                                <TableHead>Last Quiz Date</TableHead>
                                <TableHead>Last Active Feature</TableHead>
                                <TableHead>Strengths</TableHead>
                                <TableHead>Weaknesses</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudentData.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="student avatar"/>
                                            <AvatarFallback>{student.name.substring(0,1)}{student.name.split(" ")[1]?.substring(0,1) || ''}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{student.grade}</TableCell>
                                    <TableCell className={student.averageQuizScore >= 80 ? "text-green-600 font-semibold" : student.averageQuizScore < 60 ? "text-red-600 font-semibold" : ""}>
                                        {student.averageQuizScore}%
                                    </TableCell>
                                    <TableCell>{student.quizzesCompleted}</TableCell>
                                    <TableCell>{student.timeSpentInApp}</TableCell>
                                    <TableCell>{student.lastQuizTimestamp}</TableCell>
                                    <TableCell className="text-xs">{student.lastActiveFeature}</TableCell>
                                    <TableCell>
                                        {student.strengths.map(s => <Badge key={s} variant="secondary" className="mr-1 mb-1 bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100">{s}</Badge>)}
                                    </TableCell>
                                    <TableCell>
                                        {student.weaknesses.map(w => <Badge key={w} variant="destructive" className="mr-1 mb-1">{w}</Badge>)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground text-center py-4">No student data matches the current filter.</p>
                )}
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
      