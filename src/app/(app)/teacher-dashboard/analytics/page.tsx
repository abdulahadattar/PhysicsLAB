// src/app/(app)/teacher-dashboard/analytics/page.tsx (or your actual path)
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, BarChart3, UserCheck, Percent, AlertTriangle, Loader2, BookOpen, CheckCircle, History, Smartphone, Laptop, Wifi, Signal, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useMemo } from "react";
import type { StudyGrade } from "@/lib/types"; // Assuming StudentAnalyticsData, FeatureUsage etc. would be here for real data
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Ensure AlertTitle is used if provided by your component
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; // For loading states

// --- MOCK DATA (Keep for now, replace with API calls eventually) ---
const overallPerformanceData = [
  { name: 'Grade 9', avgScore: 75, colorSuffix: "chart-1" }, // Using colorSuffix
  { name: 'Grade 10', avgScore: 82, colorSuffix: "chart-2" },
  { name: 'Grade 11', avgScore: 70, colorSuffix: "chart-3" },
  { name: 'Grade 12', avgScore: 88, colorSuffix: "chart-4" },
];

const quizPerformanceByTopicData = [
  { topic: 'Kinematics', correct: 0.60, incorrect: 0.40 }, // Values as proportions (0 to 1)
  { topic: 'Optics', correct: 0.55, incorrect: 0.45 },
  { topic: 'Electromagnetism', correct: 0.70, incorrect: 0.30 },
  { topic: 'Thermodynamics', correct: 0.50, incorrect: 0.50 },
];

const mockStudentData = [ // Assuming this would be fetched and typed
    { id: "s001", name: "Ahmed Ali", grade: "Grade 9", averageQuizScore: 85, quizzesCompleted: 12, timeSpentInApp: "18h 45m", lastQuizTimestamp: "2024-05-21", lastLogin: "2024-05-23 10:15 AM", averageSessionDuration: "42 min", totalSessions: 25, mostUsedFeature: "Simulations", lastActiveFeature: "Simulations (Projectile Motion - 15min)", avatar: "https://placehold.co/40x40.png?text=AA", strengths: ["Kinematics", "Dynamics"], weaknesses: ["Optics"], deviceType: "Desktop", networkTypeGuess: "Wi-Fi" },
    { id: "s002", name: "Fatima Khan", grade: "Grade 10", averageQuizScore: 72, quizzesCompleted: 8, timeSpentInApp: "12h 15m", lastQuizTimestamp: "2024-05-19", lastLogin: "2024-05-22 08:30 PM", averageSessionDuration: "55 min", totalSessions: 18, mostUsedFeature: "Study Material", lastActiveFeature: "Study Material (Electromagnetism - 25min)", avatar: "https://placehold.co/40x40.png?text=FK", strengths: ["Electromagnetism"], weaknesses: ["Thermodynamics", "Optics"], deviceType: "Mobile", networkTypeGuess: "Cellular" },
    { id: "s003", name: "Bilal Hassan", grade: "Grade 9", averageQuizScore: 91, quizzesCompleted: 15, timeSpentInApp: "22h 00m", lastQuizTimestamp: "2024-05-22", lastLogin: "2024-05-23 01:00 PM", averageSessionDuration: "60 min", totalSessions: 30, mostUsedFeature: "Quizzes", lastActiveFeature: "Quizzes (Daily Challenge - 12 attempts)", avatar: "https://placehold.co/40x40.png?text=BH", strengths: ["All Topics"], weaknesses: ["None apparent"], deviceType: "Desktop", networkTypeGuess: "Wi-Fi" },
];

const mockFeatureUsageData = [
    { name: 'Simulations', value: 400, colorSuffix: 'chart-1' },
    { name: 'Study Material', value: 300, colorSuffix: 'chart-2' },
    { name: 'Quizzes', value: 200, colorSuffix: 'chart-3' },
    { name: 'Learn with AI', value: 100, colorSuffix: 'chart-4' },
    { name: 'Mind Maps', value: 50, colorSuffix: 'chart-5' },
];

const mockChapterViewData = [
    { chapter: 'Kinematics (G9)', views: 150, colorSuffix: "chart-1" },
    { chapter: 'Electromagnetism (G10)', views: 120, colorSuffix: "chart-2" },
    { chapter: 'Measurements (G11)', views: 90, colorSuffix: "chart-3" },
    { chapter: 'Thermodynamics (G12)', views: 75, colorSuffix: "chart-4" },
    { chapter: 'Optics (G10)', views: 110, colorSuffix: "chart-5" },
];

const quizEngagementData = [
    { name: 'Daily Quizzes', attempts: 150, avgScore: 78 },
    { name: 'Topic: Kinematics', attempts: 80, avgScore: 72 },
    { name: 'Topic: Optics', attempts: 65, avgScore: 65 },
    { name: 'Topic: Electromagnetism', attempts: 95, avgScore: 85 },
];

const challengingConceptsData = [
    { id: 'c1', concept: "Applying Newton's Third Law in complex scenarios.", topic: "Dynamics", incorrectPercentage: 45, gradeLevel: "Grade 9" },
    { id: 'c2', concept: "Distinguishing between series and parallel capacitor configurations.", topic: "Capacitors", incorrectPercentage: 38, gradeLevel: "Grade 11" },
    { id: 'c3', concept: "Calculating range in projectile motion with initial height.", topic: "Projectile Motion", incorrectPercentage: 52, gradeLevel: "Grade 11" },
];
// --- END MOCK DATA ---


// --- CHART CONFIGS ---
const chartConfigOverall = {
  avgScore: { label: "Avg. Score (%)", color: "primary" }, // CSS variable suffix
} satisfies Parameters<typeof ChartContainer>[0]["config"];

const chartConfigTopics = {
  correct: { label: "Correct", color: "success" }, // e.g., --color-success
  incorrect: { label: "Incorrect", color: "destructive" }, // e.g., --color-destructive
} satisfies Parameters<typeof ChartContainer>[0]["config"];

const chartConfigFeatureUsage = { // Example config for Pie chart
    value: { label: "Usage Count" }
    // Add individual items if you want specific colors tied to names via config
    // 'Simulations': { label: "Simulations", color: "chart-1"}, ...
} satisfies Parameters<typeof ChartContainer>[0]["config"];

const chartConfigChapterViews = {
    views: { label: "Views", color: "info" } // e.g. --color-info
} satisfies Parameters<typeof ChartContainer>[0]["config"];

const chartConfigEngagement = {
    attempts: { label: "Attempts", color: "chart-1" },
    avgScore: { label: "Avg. Score (%)", color: "chart-2" }
} satisfies Parameters<typeof ChartContainer>[0]["config"];
// --- END CHART CONFIGS ---

// TODO: Extract individual chart/table sections into their own components for better maintainability.
// Example: <OverallPerformanceChart data={overallPerformanceData} config={chartConfigOverall} />
// Example: <StudentPerformanceTable students={filteredStudentData} />

export default function TeacherAnalyticsPage() {
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("all");

  // TODO: Replace mock data with actual API calls and loading states for each data set.
  // const [studentData, setStudentData] = useState([]);
  // const [isLoadingStudentData, setIsLoadingStudentData] = useState(true);

  useEffect(() => {
    async function fetchGradesForFilter() {
      setIsLoadingGrades(true);
      setGradesError(null);
      try {
        const res = await fetch('/api/study-materials'); // Assuming this returns StudyGrade[]
        if (!res.ok) {
          throw new Error(`Failed to fetch study grades: ${res.status} ${res.statusText}`);
        }
        const data: StudyGrade[] = await res.json();
        setStudyGrades(data);
      } catch (error) {
        console.error("Error fetching study grades for filter:", error);
        setGradesError(error instanceof Error ? error.message : "An unknown error occurred fetching grades.");
      } finally {
        setIsLoadingGrades(false);
      }
    }
    fetchGradesForFilter();
  }, []);

  const filteredStudentData = useMemo(() => {
    if (selectedGradeFilter === "all") {
      return mockStudentData;
    }
    const selectedGradeName = studyGrades.find(sg => sg.id === selectedGradeFilter)?.name;
    if (!selectedGradeName) {
        return mockStudentData; // Or [] if no grade name found means filter should show nothing
    }
    return mockStudentData.filter(student => student.grade === selectedGradeName);
  }, [mockStudentData, selectedGradeFilter, studyGrades]);


  // --- RENDER HELPER FOR NO DATA ---
  const renderNoData = (message = "No data available for this section.") => (
    <div className="flex items-center justify-center h-full py-8 text-muted-foreground">
      <AlertTriangle className="h-5 w-5 mr-2" />
      <p>{message}</p>
    </div>
  );

  // --- RENDER HELPER FOR LOADING SKELETON (Chart Example) ---
  const renderChartSkeleton = (height = "300px") => (
    <div style={{ height }} className="w-full p-4">
        <Skeleton className="h-6 w-3/4 mb-4" /> {/* Title Placeholder */}
        <Skeleton className={`h-[calc(${height}-40px)] w-full`} /> {/* Chart Area Placeholder */}
    </div>
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
          <CardDescription>View overall student performance, quiz results, app usage, and identify common weak areas.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Summary Cards TODO: Make data dynamic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1"><UserCheck className="h-4 w-4"/>Active Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{mockStudentData.length}</p>
                        {/* <p className="text-xs text-muted-foreground">+2 since last week</p> */}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1"><Percent className="h-4 w-4"/>Overall Avg. Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {(mockStudentData.reduce((acc, s) => acc + s.averageQuizScore, 0) / (mockStudentData.length || 1)).toFixed(1)}%
                        </p>
                        {/* <p className="text-xs text-muted-foreground">Across all grades</p> */}
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
                        {/* <p className="text-xs text-muted-foreground">By all students</p> */}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1"><History className="h-4 w-4 text-blue-500"/>Avg. Time (Mock)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">~15h 20m</p>
                        {/* <p className="text-xs text-muted-foreground">Per active student</p> */}
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
                    <AlertTitle>Error Loading Grade Filters</AlertTitle>
                    <AlertDescription>{gradesError}</AlertDescription>
                  </Alert>
                )}
                {!isLoadingGrades && !gradesError && studyGrades.length > 0 && (
                  <Select value={selectedGradeFilter} onValueChange={setSelectedGradeFilter}>
                      <SelectTrigger className="w-full md:w-[280px]">
                          <SelectValue placeholder="Filter by Grade" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectGroup>
                          <SelectLabel>Grades</SelectLabel>
                          <SelectItem value="all">All Grades</SelectItem>
                          {studyGrades.map(grade => (
                              <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                          ))}
                          </SelectGroup>
                      </SelectContent>
                  </Select>
                )}
                 {!isLoadingGrades && !gradesError && studyGrades.length === 0 && (
                    <p className="text-sm text-muted-foreground">No grades available for filtering.</p>
                 )}
            </div>

          {/* Charts Grid 1 */}
          {/* TODO: Add loading skeletons if this data were fetched asynchronously */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 mb-6">
            <Card className="xl:col-span-1">
              <CardHeader>
                <CardTitle>Overall Performance by Grade</CardTitle>
                <CardDescription>Average quiz scores for each grade level.</CardDescription>
              </CardHeader>
              <CardContent>
                {overallPerformanceData.length > 0 ? (
                    <ChartContainer config={chartConfigOverall} className="h-[300px] w-full">
                    <BarChart data={overallPerformanceData} layout="vertical" margin={{left:10, right: 30}}>
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" dataKey="avgScore" domain={[0,100]} tickFormatter={(value) => `${value}%`}/>
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel indicator="line"/>} />
                        <Bar dataKey="avgScore" radius={5}>
                            {overallPerformanceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(var(--${entry.colorSuffix || `chart-${index + 1}`}))`} />
                            ))}
                        </Bar>
                    </BarChart>
                    </ChartContainer>
                ) : renderNoData()}
              </CardContent>
            </Card>
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Quiz Performance by Topic (All Grades)</CardTitle>
                 <CardDescription>Percentage of correct vs. incorrect answers by topic.</CardDescription>
              </CardHeader>
              <CardContent>
                {quizPerformanceByTopicData.length > 0 ? (
                    <ChartContainer config={chartConfigTopics} className="h-[300px] w-full">
                    <BarChart data={quizPerformanceByTopicData} layout="horizontal" barCategoryGap={10} stackOffset="expand">
                        <CartesianGrid vertical={false} />
                        <XAxis type="category" dataKey="topic" tickLine={false} axisLine={false} />
                        <YAxis type="number" tickFormatter={(value) => `${Math.round(value * 100)}%`} domain={[0,1]}/>
                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${(Number(value) * 100).toFixed(0)}%`}/>} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="correct" stackId="a" fill="var(--color-success)" radius={[0, 4, 4, 0]} nameKey="config.correct.label" />
                        <Bar dataKey="incorrect" stackId="a" fill="var(--color-destructive)" radius={[4, 0, 0, 4]} nameKey="config.incorrect.label"/>
                    </BarChart>
                    </ChartContainer>
                ) : renderNoData()}
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
                    {mockChapterViewData.length > 0 ? (
                        <ChartContainer config={chartConfigChapterViews} className="h-[250px] w-full">
                            <BarChart data={mockChapterViewData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid horizontal={false} />
                                <XAxis type="number" dataKey="views" />
                                <YAxis dataKey="chapter" type="category" tickLine={false} axisLine={false} width={120} interval={0}/>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" hideLabel/>} />
                                <Bar dataKey="views" radius={4}>
                                    {mockChapterViewData.map((entry, index) => (
                                        <Cell key={`cell-views-${index}`} fill={`hsl(var(--${entry.colorSuffix || `chart-${index + 1}`}))`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    ) : renderNoData()}
                </CardContent>
            </Card>
             <Card className="xl:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-1"><TrendingUp className="h-5 w-5 text-green-500"/>App Feature Usage</CardTitle>
                    <CardDescription>How students use different app sections.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-[250px]">
                   {mockFeatureUsageData.length > 0 ? (
                    <ChartContainer config={chartConfigFeatureUsage} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie 
                                    data={mockFeatureUsageData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    labelLine={false} 
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                >
                                    {mockFeatureUsageData.map((entry, index) => (
                                        <Cell key={`cell-feature-${index}`} fill={`hsl(var(--${entry.colorSuffix || `chart-${index + 1}`}))`} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} className="text-xs [&_button]:p-0 [&_button]:text-xs" />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                   ) : renderNoData()}
                </CardContent>
            </Card>
            <Card className="xl:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-1"><Activity className="h-5 w-5 text-indigo-500"/>Quiz Engagement</CardTitle>
                    <CardDescription>Attempts and average scores for quiz categories.</CardDescription>
                </CardHeader>
                <CardContent>
                    {quizEngagementData.length > 0 ? (
                        <ChartContainer config={chartConfigEngagement} className="h-[250px] w-full">
                            <BarChart data={quizEngagementData} margin={{ left: -20, right: 5 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickFormatter={(value) => value.length > 15 ? `${value.substring(0,13)}...` : value} interval={0} />
                                <YAxis yAxisId="left" dataKey="attempts" stroke="var(--color-chart-1)" nameKey="config.attempts.label"/>
                                <YAxis yAxisId="right" dataKey="avgScore" orientation="right" stroke="var(--color-chart-2)" domain={[0,100]} tickFormatter={(v) => `${v}%`} nameKey="config.avgScore.label" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar yAxisId="left" dataKey="attempts" fill="var(--color-chart-1)" radius={4} nameKey="config.attempts.label" />
                                <Bar yAxisId="right" dataKey="avgScore" fill="var(--color-chart-2)" radius={4} nameKey="config.avgScore.label" />
                            </BarChart>
                        </ChartContainer>
                    ) : renderNoData()}
                </CardContent>
            </Card>
          </div>

          {/* Commonly Challenging Concepts Table */}
          <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive"/>Commonly Challenging Concepts</CardTitle>
                <CardDescription>Based on aggregated incorrect quiz answers (mock data).</CardDescription>
            </CardHeader>
            <CardContent className={challengingConceptsData.length === 0 ? "" : "overflow-x-auto"}>
                {challengingConceptsData.length > 0 ? (
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
                ) : renderNoData()}
            </CardContent>
          </Card>

          {/* Detailed Student Performance Table */}
          <Card>
            <CardHeader>
                <CardTitle>Detailed Student Performance</CardTitle>
                <CardDescription>Individual student statistics. Filter by grade above.</CardDescription>
            </CardHeader>
            <CardContent className={filteredStudentData.length === 0 ? "" : "overflow-x-auto"}>
                {filteredStudentData.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Avatar</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Avg. Score</TableHead>
                                <TableHead>Quizzes Done</TableHead>
                                <TableHead>Total Time</TableHead>
                                <TableHead>Last Quiz</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead>Device</TableHead>
                                <TableHead>Network</TableHead>
                                {/* <TableHead>Avg. Session</TableHead>
                                <TableHead>Total Sessions</TableHead>
                                <TableHead>Most Used Feature</TableHead>
                                <TableHead>Last Active Feature</TableHead>
                                <TableHead>Strengths</TableHead>
                                <TableHead>Weaknesses</TableHead> */}
                                 <TableHead className="text-right">Actions</TableHead> {/* Placeholder for actions */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudentData.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={student.avatar} alt={student.name} />
                                            <AvatarFallback>{student.name.substring(0,1)}{(student.name.split(" ")[1] || "").substring(0,1)}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{student.grade}</TableCell>
                                    <TableCell className={student.averageQuizScore >= 80 ? "text-green-600 font-semibold" : student.averageQuizScore < 60 ? "text-red-600 font-semibold" : ""}>
                                        {student.averageQuizScore}%
                                    </TableCell>
                                    <TableCell>{student.quizzesCompleted}</TableCell>
                                    <TableCell>{student.timeSpentInApp}</TableCell>
                                    <TableCell>{new Date(student.lastQuizTimestamp).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(student.lastLogin).toLocaleString()}</TableCell>
                                    <TableCell className="text-xs">
                                        {student.deviceType === "Mobile" ? <Smartphone className="h-4 w-4 inline mr-1 text-muted-foreground" /> : <Laptop className="h-4 w-4 inline mr-1 text-muted-foreground" />}
                                        {student.deviceType}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {student.networkTypeGuess === "Wi-Fi" ? <Wifi className="h-4 w-4 inline mr-1 text-blue-500" /> : <Signal className="h-4 w-4 inline mr-1 text-orange-500" />}
                                        {student.networkTypeGuess}
                                    </TableCell>
                                    {/* Hidden for brevity, uncomment if needed
                                    <TableCell>{student.averageSessionDuration}</TableCell>
                                    <TableCell>{student.totalSessions}</TableCell>
                                    <TableCell><Badge variant="secondary">{student.mostUsedFeature}</Badge></TableCell>
                                    <TableCell className="text-xs max-w-[150px] truncate">{student.lastActiveFeature}</TableCell>
                                    <TableCell className="max-w-[150px]">
                                        {student.strengths.map(s => <Badge key={s} variant="outline" className="mr-1 mb-1 border-green-500 text-green-600">{s}</Badge>)}
                                    </TableCell>
                                    <TableCell className="max-w-[150px]">
                                        {student.weaknesses.map(w => <Badge key={w} variant="destructive" className="mr-1 mb-1">{w}</Badge>)}
                                    </TableCell>
                                    */}
                                     <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/teacher-dashboard/students/${student.id}`}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                         {isLoadingGrades ? "Loading student data..." : "No student data matches the current filter."}
                    </div>
                )}
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}