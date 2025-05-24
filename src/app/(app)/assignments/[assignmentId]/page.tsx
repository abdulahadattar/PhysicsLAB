
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, FileText, BookOpen, Orbit, ListChecks, CheckCircle, XCircle, Clock, Paperclip, Send, Link as LinkIcon } from 'lucide-react'; // Added LinkIcon

// Types and Data
import type { Assignment, StudentSubmission, SubmissionStatus } from '@/lib/types';
import { getAssignmentById } from '@/data/mockAssignments';
import { SIMULATION_TOPICS, QUIZ_TOPICS } from '@/lib/constants';
import { useUserSession } from '@/contexts/user-session-context';
import { useToast } from '@/hooks/use-toast';


export default function AssignmentPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // For student submission
  const [textSubmission, setTextSubmission] = useState('');
  const [fileLinkSubmission, setFileLinkSubmission] = useState(''); // Changed from fileSubmission
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser, userRole } = useUserSession();

  useEffect(() => {
    if (assignmentId) {
      const fetchAssignment = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Pass the current user's ID to potentially fetch their specific submission
          const studentIdForFetch = userRole === 'student' && currentUser ? currentUser.uid : undefined;
          const data = await getAssignmentById(assignmentId, studentIdForFetch);

          if (data) {
            setAssignment(data);
            if (userRole === 'student' && data.studentSpecificSubmission) {
              setTextSubmission(data.studentSpecificSubmission.textSubmission || '');
              setFileLinkSubmission(data.studentSpecificSubmission.fileLink || ''); // Use fileLink
            }
          } else {
            setError('Assignment not found.');
          }
        } catch (e) {
          setError('Failed to load assignment details.');
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAssignment();
    }
  }, [assignmentId, userRole, currentUser]);

  const handleSubmit = async () => {
    if (!assignment || !currentUser) return;

    // Basic validation: if file submission is allowed, either text or a file link should be present
    if (assignment.submissionType.includes('file') && !textSubmission.trim() && !fileLinkSubmission.trim()) {
        toast({title: "Submission Incomplete", description: "Please provide a text submission or a file link.", variant: "destructive"});
        return;
    }
    if (assignment.submissionType === 'text' && !textSubmission.trim()) {
        toast({title: "Submission Incomplete", description: "Please provide a text submission.", variant: "destructive"});
        return;
    }


    setIsSubmitting(true);
    console.log("Submitting:", { textSubmission, fileLinkSubmission });
    // TODO: Implement actual submission logic to a backend if available.
    // For now, simulate and update local state.
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const newSubmissionStatus: SubmissionStatus = 'Submitted';
    // Simulate saving the submission
    const updatedSubmission: StudentSubmission = {
        ...(assignment.studentSpecificSubmission || { studentId: currentUser.uid, submittedAt: '', status: 'Not Submitted'}),
        textSubmission: textSubmission,
        fileLink: fileLinkSubmission, // Save fileLink
        fileName: fileLinkSubmission ? new URL(fileLinkSubmission).pathname.split('/').pop() || 'shared_file' : undefined, // Try to get a filename from URL
        status: newSubmissionStatus,
        submittedAt: new Date().toISOString(),
    };
    
    setAssignment(prev => prev ? ({
      ...prev,
      studentSpecificSubmission: updatedSubmission
    }) : null);

    // If MOCK_ASSIGNMENTS were mutable and shared across users (which it isn't in this client-side setup),
    // you'd also update it here. For a backend, this would be an API call.
    const mockAssignmentIndex = getAssignmentById.MOCK_ASSIGNMENTS_INTERNAL_TEMP.findIndex(a => a.id === assignment.id);
    if (mockAssignmentIndex !== -1) {
        getAssignmentById.MOCK_ASSIGNMENTS_INTERNAL_TEMP[mockAssignmentIndex] = {
            ...getAssignmentById.MOCK_ASSIGNMENTS_INTERNAL_TEMP[mockAssignmentIndex],
            studentSpecificSubmission: updatedSubmission
        };
         // If it's a teacher, also update/add to allStudentSubmissions for demonstration
        if (userRole === 'teacher') {
            let submissions = getAssignmentById.MOCK_ASSIGNMENTS_INTERNAL_TEMP[mockAssignmentIndex].allStudentSubmissions || [];
            const existingSubIndex = submissions.findIndex(s => s.studentId === currentUser.uid);
            if (existingSubIndex > -1) {
                submissions[existingSubIndex] = updatedSubmission;
            } else {
                submissions.push(updatedSubmission);
            }
            getAssignmentById.MOCK_ASSIGNMENTS_INTERNAL_TEMP[mockAssignmentIndex].allStudentSubmissions = submissions;
        }
    }


    toast({ title: "Assignment Submitted!", description: "Your work has been submitted for review." });
    setIsSubmitting(false);
  };

  const getStatusBadgeColor = (status?: SubmissionStatus): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'Graded': return 'default'; 
      case 'Submitted': return 'secondary';
      case 'Late': return 'destructive'; // Changed from 'warning' as warning variant isn't standard for Badge
      case 'Not Submitted': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) return <div className="p-4 text-center"><p>Loading assignment details...</p></div>;
  if (error) return <Alert variant="destructive" className="m-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  if (!assignment) return <div className="p-4 text-center">Assignment not found.</div>;

  const currentStudentSubmission = assignment.studentSpecificSubmission;
  const canStudentSubmit = userRole === 'student' && 
                           assignment.submissionType !== 'none' && 
                           (!currentStudentSubmission || currentStudentSubmission.status === 'Not Submitted' || currentStudentSubmission.status === 'Late');


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <CardTitle className="text-2xl md:text-3xl">{assignment.title}</CardTitle>
            {userRole === 'student' && currentStudentSubmission && (
              <Badge variant={getStatusBadgeColor(currentStudentSubmission.status)} className="whitespace-nowrap">
                {currentStudentSubmission.status}
              </Badge>
            )}
          </div>
          <CardDescription>
            Due: {new Date(assignment.dueDate).toLocaleString()}
            {assignment.pointsPossible && ` | Points Possible: ${assignment.pointsPossible}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground whitespace-pre-wrap">{assignment.description}</p>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">Associated Materials</h3>
            {(assignment.associatedSimulations?.length || 0) > 0 && (
              <div className="mb-3">
                <h4 className="text-md font-medium mb-1">Simulations:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  {assignment.associatedSimulations?.map(simId => {
                    const sim = SIMULATION_TOPICS.find(s => s.id === simId);
                    return sim ? (
                      <li key={simId}>
                        <Link href={`/simulations/${sim.id}`} className="text-primary hover:underline flex items-center">
                          <Orbit className="mr-2 h-4 w-4 flex-shrink-0" /> {sim.name} <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                        </Link>
                      </li>
                    ) : <li key={simId} className="text-sm text-muted-foreground">Simulation ID: {simId} (not found)</li>;
                  })}
                </ul>
              </div>
            )}
            {(assignment.associatedQuizzes?.length || 0) > 0 && (
               <div className="mb-3">
                <h4 className="text-md font-medium mb-1">Quizzes:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  {assignment.associatedQuizzes?.map(quizId => {
                    const quiz = QUIZ_TOPICS.find(q => q.id === quizId);
                    return quiz ? (
                      <li key={quizId}>
                        <Link href={`/quizzes/topic/${quiz.id}`} className="text-primary hover:underline flex items-center">
                          <ListChecks className="mr-2 h-4 w-4 flex-shrink-0" /> {quiz.name} <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                        </Link>
                      </li>
                    ) : <li key={quizId} className="text-sm text-muted-foreground">Quiz ID: {quizId} (not found)</li>;
                  })}
                </ul>
              </div>
            )}
            {!(assignment.associatedSimulations?.length || 0) && !(assignment.associatedQuizzes?.length || 0) && (
              <p className="text-sm text-muted-foreground">No associated learning materials linked to this assignment.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Submission Area */}
      {canStudentSubmit && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Submit Your Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignment.submissionType.includes('text') && (
              <div>
                <label htmlFor="textSubmission" className="block text-sm font-medium mb-1">Text Submission</label>
                <Textarea
                  id="textSubmission"
                  value={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  placeholder="Type your submission here..."
                  rows={8}
                />
              </div>
            )}
            {assignment.submissionType.includes('file') && ( // 'file' implies link submission now
              <div>
                <label htmlFor="fileLinkSubmission" className="block text-sm font-medium mb-1">File Link (e.g., Google Drive, Dropbox)</label>
                <Input
                  id="fileLinkSubmission"
                  type="url"
                  value={fileLinkSubmission}
                  onChange={(e) => setFileLinkSubmission(e.target.value)}
                  placeholder="Paste a shareable link to your file here"
                />
                <p className="text-xs text-muted-foreground mt-1">Ensure your link provides view access.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : <><Send className="mr-2 h-4 w-4"/> Submit Assignment</>}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Student's Submitted Work & Feedback Area (Student View) */}
      {userRole === 'student' && currentStudentSubmission && (currentStudentSubmission.status === 'Submitted' || currentStudentSubmission.status === 'Graded') && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-6 w-6 text-green-500"/> Your Submission
            </CardTitle>
            <CardDescription>Submitted on: {new Date(currentStudentSubmission.submittedAt).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStudentSubmission.textSubmission && (
              <div>
                <h4 className="font-semibold mb-1">Text Submitted:</h4>
                <div className="whitespace-pre-wrap p-3 bg-muted rounded-md text-sm">{currentStudentSubmission.textSubmission}</div>
              </div>
            )}
            {currentStudentSubmission.fileLink && (
              <div>
                <h4 className="font-semibold mb-1">File Link Submitted:</h4>
                <div className="flex items-center p-2 bg-muted rounded-md">
                  <LinkIcon className="mr-2 h-5 w-5 text-primary" />
                  <a href={currentStudentSubmission.fileLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm truncate">
                    {currentStudentSubmission.fileName || currentStudentSubmission.fileLink}
                  </a>
                </div>
              </div>
            )}
            {currentStudentSubmission.status === 'Graded' && (
              <Alert className="bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                <CheckCircle className="h-4 w-4 !text-green-600 dark:!text-green-400" />
                <AlertTitle className="text-green-700 dark:text-green-300">Graded!</AlertTitle>
                <AlertDescription className="space-y-1 text-green-600 dark:text-green-400">
                  {currentStudentSubmission.grade && <p><strong>Grade:</strong> {currentStudentSubmission.grade}</p>}
                  {currentStudentSubmission.feedback && <p><strong>Feedback:</strong> {currentStudentSubmission.feedback}</p>}
                </AlertDescription>
              </Alert>
            )}
             {currentStudentSubmission.status === 'Submitted' && (
              <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700">
                <Clock className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
                <AlertTitle className="text-blue-700 dark:text-blue-300">Awaiting Grade</AlertTitle>
                <AlertDescription className="text-blue-600 dark:text-blue-400">
                  Your assignment has been submitted and is awaiting grading.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Teacher Feedback/Grading Area (Teacher View - Placeholder) */}
      {userRole === 'teacher' && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Student Submissions & Grading</CardTitle>
            <CardDescription>Manage and grade student submissions for this assignment. (Actual grading interface to be built)</CardDescription>
          </CardHeader>
          <CardContent>
            {assignment.allStudentSubmissions && assignment.allStudentSubmissions.length > 0 ? (
              assignment.allStudentSubmissions.map(sub => (
                <div key={sub.studentId} className="border p-3 rounded-md mb-2 bg-secondary/30">
                  <p><strong>Student:</strong> {sub.studentName || sub.studentId} - <Badge variant={getStatusBadgeColor(sub.status)}>{sub.status}</Badge></p>
                  {sub.textSubmission && <p className="mt-1 text-sm"><strong>Text:</strong> {sub.textSubmission.substring(0,100)}...</p>}
                  {sub.fileLink && 
                    <div className="mt-1 text-sm flex items-center">
                      <LinkIcon className="mr-1 h-4 w-4 text-primary" />
                      <strong>File Link:</strong> 
                      <a href={sub.fileLink} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline truncate">
                         {sub.fileName || sub.fileLink}
                      </a>
                    </div>
                  }
                  <Button variant="outline" size="sm" className="mt-2">View & Grade (Placeholder)</Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No submissions yet for this assignment.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
