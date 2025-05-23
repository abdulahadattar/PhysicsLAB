
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // For file input simulation
import { Label } from "@/components/ui/label"; // For file input simulation
import { AlertTriangle, Edit, CheckCircle, Clock, FileUp, School } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Assignment, StudyGrade } from '@/lib/types'; // Assuming StudyGrade might be needed for grade names
import { format, parseISO, isPast } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const ASSIGNMENTS_STORAGE_KEY = 'physicsLabAssignments';

export default function StudentAssignmentsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]); // To map grade IDs to names
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch grades to map IDs to names
      const gradesRes = await fetch('/api/study-materials');
      if (gradesRes.ok) {
        const gradesData: StudyGrade[] = await gradesRes.json();
        setStudyGrades(gradesData);
      } else {
        console.warn("Could not fetch grade names for assignments.");
      }

      // Load assignments from localStorage
      const storedData = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      const loadedAssignments = storedData ? JSON.parse(storedData) : [];
      // Sort by due date (sooner first), then by creation date (newer first)
      setAssignments(
        loadedAssignments.sort((a: Assignment, b: Assignment) => {
          const dueDateA = parseISO(a.dueDate).getTime();
          const dueDateB = parseISO(b.dueDate).getTime();
          if (dueDateA !== dueDateB) return dueDateA - dueDateB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
      );
    } catch (e) {
      console.error("Error loading assignments or grades:", e);
      setError("Could not load assignments. Please try again later.");
      setAssignments([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleSimulatedFileUpload = (assignmentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        toast({
            title: "File Selected (Simulated)",
            description: `"${file.name}" ready for assignment "${assignments.find(a=>a.id === assignmentId)?.title}". Actual upload not implemented.`,
        });
        // In a real app, you'd handle the upload here
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center p-10"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <Edit className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Assignments</CardTitle>
          <CardDescription>View assignments posted by your teacher. Pay attention to due dates and submission instructions.</CardDescription>
        </CardHeader>
      </Card>

      {assignments.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">No assignments posted at the moment. Check back later!</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 items-start">
          {assignments.map(assignment => {
            const dueDateObj = parseISO(assignment.dueDate);
            const isPastDue = isPast(dueDateObj) && !isToday(dueDateObj); // isPast includes today, so exclude today
            const targetGradeNames = assignment.targetGradeIds.map(id => studyGrades.find(g => g.id === id)?.name).filter(Boolean).join(', ');

            return (
              <Card key={assignment.id} className={`shadow-md hover:shadow-lg transition-shadow ${isPastDue ? 'opacity-70 bg-secondary/30' : 'bg-card'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{assignment.title}</CardTitle>
                  <div className="text-xs text-muted-foreground space-x-2">
                    <span>Targets: {targetGradeNames || "All Grades"}</span>
                    <span className={`font-semibold ${isPastDue ? 'text-destructive' : 'text-primary'}`}>
                      Due: {format(dueDateObj, "PPP")} {isPastDue && "(Past Due)"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm whitespace-pre-wrap mb-4">{assignment.description}</p>
                  
                  <div className="border-t pt-3 space-y-3">
                    <h4 className="text-sm font-semibold">Submission Instructions:</h4>
                    { (assignment.submissionType === 'online' || assignment.submissionType === 'both') && assignment.onlineSubmissionEnabled && (
                      <div className="p-3 border rounded-md bg-background space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                           <FileUp className="h-4 w-4"/> <span>Online PDF Submission Portal Enabled</span>
                        </div>
                        <Label htmlFor={`file-upload-${assignment.id}`} className="sr-only">Upload PDF</Label>
                        <Input 
                            id={`file-upload-${assignment.id}`} 
                            type="file" 
                            accept=".pdf" 
                            className="text-xs h-9" 
                            onChange={(e) => handleSimulatedFileUpload(assignment.id, e)}
                            disabled={isPastDue}
                        />
                        {isPastDue && <p className="text-xs text-destructive">Submission deadline has passed for online uploads.</p>}
                         <p className="text-xs text-muted-foreground">Actual file upload is not implemented in this demo.</p>
                      </div>
                    )}
                     { (assignment.submissionType === 'online' || assignment.submissionType === 'both') && !assignment.onlineSubmissionEnabled && (
                      <div className="p-3 border rounded-md bg-muted text-muted-foreground text-sm">
                        Online submission portal is currently disabled by the teacher for this assignment.
                      </div>
                    )}
                    { (assignment.submissionType === 'physical' || assignment.submissionType === 'both') && (
                      <div className="p-3 border rounded-md bg-background flex items-center gap-2 text-sm">
                        <School className="h-4 w-4 text-blue-600 dark:text-blue-400"/>
                        <span>Submit physically in school as per teacher's instructions.</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper function to check if a date is today (ignoring time)
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

