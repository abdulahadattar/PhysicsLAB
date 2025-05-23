
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, PlusCircle, Trash2, Edit, Save, Loader2, AlertTriangle, Eye, EyeOff, FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Assignment, StudyGrade, Submission } from '@/lib/types';
import { format, parseISO, isValid, addDays, subDays } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ASSIGNMENTS_STORAGE_KEY = 'physicsLabAssignments';
const ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY = 'physicsLabAssignmentSubmissions';

const MOCK_STUDENTS = [
  { id: 'std_001', name: 'Aisha Khan' },
  { id: 'std_002', name: 'Bilal Ahmed' },
  { id: 'std_003', name: 'Fatima Ali' },
  { id: 'std_004', name: 'Usman Tariq' },
];

export default function ManageAssignmentsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({});
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState<string | null>(null);
  const [editingSubmissionStates, setEditingSubmissionStates] = useState<Record<string, Partial<Submission>>>({});


  const resetForm = () => {
    setCurrentAssignment({});
    setIsEditing(null);
  };

  const fetchGrades = useCallback(async () => {
    setIsLoadingGrades(true);
    try {
      const res = await fetch('/api/study-materials');
      if (!res.ok) throw new Error('Failed to fetch grades');
      const data: StudyGrade[] = await res.json();
      setStudyGrades(data);
    } catch (e) {
      console.error("Error fetching study grades:", e);
      toast({ title: "Error", description: "Could not load grades for selection.", variant: "destructive" });
    }
    setIsLoadingGrades(false);
  }, [toast]);

  const loadAssignmentsAndSubmissions = useCallback(() => {
    try {
      const storedAssignments = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      const loadedAssignments = storedAssignments ? JSON.parse(storedAssignments) : [];
      setAssignments(loadedAssignments.sort((a: Assignment, b: Assignment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      const storedSubmissions = localStorage.getItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY);
      const loadedSubmissions = storedSubmissions ? JSON.parse(storedSubmissions) : [];
      setAllSubmissions(loadedSubmissions);

    } catch (e) {
      console.error("Error loading assignments or submissions:", e);
      toast({ title: "Error Loading Data", description: "Could not load saved assignments or submissions.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchGrades();
    loadAssignmentsAndSubmissions();
  }, [fetchGrades, loadAssignmentsAndSubmissions]);

  const handleSaveAssignments = useCallback(() => {
    setIsSaving(true);
    try {
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
      toast({ title: "Assignments Saved", description: "Assignment changes have been saved locally." });
    } catch (e) {
      console.error("Error saving assignments:", e);
      toast({ title: "Save Failed", description: "Could not save assignments.", variant: "destructive" });
    }
    setIsSaving(false);
  }, [assignments, toast]);

  const handleSaveSubmissions = useCallback(() => {
    try {
      localStorage.setItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY, JSON.stringify(allSubmissions));
      // No toast here, to avoid too many toasts if individual submissions are saved.
    } catch (e) {
      console.error("Error saving submissions:", e);
      toast({ title: "Save Failed", description: "Could not save submission data.", variant: "destructive" });
    }
  }, [allSubmissions, toast]);


  const handleFormChange = (field: keyof Assignment, value: any) => {
    setCurrentAssignment(prev => ({ ...prev, [field]: value }));
  };

  const handleTargetGradeChange = (gradeId: string, checked: boolean | string) => {
    const currentTargetGrades = currentAssignment.targetGradeIds || [];
    if (checked) {
      handleFormChange('targetGradeIds', [...currentTargetGrades, gradeId]);
    } else {
      handleFormChange('targetGradeIds', currentTargetGrades.filter(id => id !== gradeId));
    }
  };

  const handleSubmitAssignment = () => {
    if (!currentAssignment.title?.trim() || !currentAssignment.description?.trim() || !currentAssignment.dueDate || (currentAssignment.targetGradeIds || []).length === 0 || !currentAssignment.submissionType) {
      toast({ title: "Missing Information", description: "Please fill all required fields: Title, Description, Target Grade(s), Due Date, and Submission Type.", variant: "destructive" });
      return;
    }

    let updatedAssignments;
    if (isEditing) {
      updatedAssignments = assignments.map(a => a.id === isEditing ? { ...a, ...currentAssignment } as Assignment : a);
      toast({ title: "Assignment Updated", description: `"${currentAssignment.title}" has been updated.` });
    } else {
      const newAssignment: Assignment = {
        id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        ...currentAssignment,
      } as Assignment;
      updatedAssignments = [newAssignment, ...assignments];
      toast({ title: "Assignment Added", description: `"${newAssignment.title}" has been added.` });
    }
    setAssignments(updatedAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    resetForm();
    handleSaveAssignments(); 
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setIsEditing(assignment.id);
    const dueDate = assignment.dueDate ? parseISO(assignment.dueDate) : undefined;
    setCurrentAssignment({ ...assignment, dueDate: isValid(dueDate) ? dueDate : undefined });
    setViewingSubmissionsFor(null); // Close submissions view when editing assignment
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    setAllSubmissions(prev => prev.filter(s => s.assignmentId !== id)); // Also remove related submissions
    handleSaveAssignments();
    handleSaveSubmissions();
    toast({ title: "Assignment Deleted", description: "The assignment and its submissions have been removed." });
    if (viewingSubmissionsFor === id) {
        setViewingSubmissionsFor(null);
    }
  };

  const toggleViewSubmissions = (assignmentId: string) => {
    setViewingSubmissionsFor(prev => {
      if (prev === assignmentId) return null; // Toggle off if already viewing

      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) return prev;

      const existingSubmissions = allSubmissions.filter(s => s.assignmentId === assignmentId);
      if (existingSubmissions.length === 0) {
        const newMockSubmissions: Submission[] = MOCK_STUDENTS.slice(0, Math.floor(Math.random() * MOCK_STUDENTS.length) + 1) // 1 to 4 mock submissions
          .map((student, index) => ({
            id: `sub_${assignmentId}_${student.id}_${Date.now() + index}`,
            assignmentId: assignmentId,
            studentId: student.id,
            studentName: student.name,
            submittedAt: subDays(parseISO(assignment.dueDate), Math.floor(Math.random() * 3)).toISOString(),
            submittedContentLink: `submission_${student.name.replace(' ', '_')}_${assignment.title.substring(0,10).replace(' ', '_')}.pdf`,
            status: 'pending_review',
            marks: '',
            remarks: '',
            rejectionReason: '',
          }));
        setAllSubmissions(prevSubs => [...prevSubs, ...newMockSubmissions]);
        handleSaveSubmissions(); // Save after generating mock submissions
      }
      return assignmentId;
    });
  };

  const handleSubmissionEditChange = (submissionId: string, field: keyof Submission, value: string | number) => {
    setEditingSubmissionStates(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      }
    }));
  };

  const handleSaveSubmissionFeedback = (submissionId: string) => {
    const editedFields = editingSubmissionStates[submissionId];
    if (!editedFields) return;

    setAllSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        return { ...sub, ...editedFields };
      }
      return sub;
    }));
    handleSaveSubmissions();
    setEditingSubmissionStates(prev => { // Clear editing state for this submission
      const newState = {...prev};
      delete newState[submissionId];
      return newState;
    });
    toast({ title: "Feedback Saved", description: `Feedback for submission ${submissionId.substring(0, 8)}... has been saved.` });
  };
  
  const getSubmissionsForAssignment = (assignmentId: string) => {
    return allSubmissions.filter(s => s.assignmentId === assignmentId);
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Edit className="h-7 w-7 text-primary"/>Manage Assignments</CardTitle>
          <CardDescription>Create, edit, and manage homework assignments. View mock submissions and provide feedback.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">{isEditing ? "Edit Assignment" : "Create New Assignment"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="assignment-title">Title <span className="text-destructive">*</span></Label>
              <Input id="assignment-title" value={currentAssignment.title || ""} onChange={e => handleFormChange('title', e.target.value)} placeholder="E.g., Chapter 3 Problems" />
            </div>
            <div>
              <Label htmlFor="assignment-description">Description <span className="text-destructive">*</span></Label>
              <Textarea id="assignment-description" value={currentAssignment.description || ""} onChange={e => handleFormChange('description', e.target.value)} placeholder="Details about the assignment..." rows={4}/>
            </div>
            <div>
                <Label>Target Grade(s) <span className="text-destructive">*</span></Label>
                {isLoadingGrades ? <Loader2 className="h-4 w-4 animate-spin my-1"/> : (
                    <div className="grid grid-cols-2 gap-2 mt-1 p-2 border rounded-md max-h-32 overflow-y-auto">
                        {studyGrades.map(grade => (
                            <div key={grade.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`grade-${grade.id}`}
                                    checked={(currentAssignment.targetGradeIds || []).includes(grade.id)}
                                    onCheckedChange={(checked) => handleTargetGradeChange(grade.id, checked)}
                                />
                                <Label htmlFor={`grade-${grade.id}`} className="font-normal text-sm">{grade.name}</Label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
             <div>
              <Label htmlFor="assignment-due-date">Due Date <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                    id="assignment-due-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentAssignment.dueDate ? format(currentAssignment.dueDate instanceof Date ? currentAssignment.dueDate : parseISO(currentAssignment.dueDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentAssignment.dueDate instanceof Date ? currentAssignment.dueDate : (currentAssignment.dueDate ? parseISO(currentAssignment.dueDate) : undefined)}
                    onSelect={(date) => handleFormChange('dueDate', date ? date.toISOString() : undefined)}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} 
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
                <Label>Submission Type <span className="text-destructive">*</span></Label>
                <RadioGroup value={currentAssignment.submissionType} onValueChange={(value) => handleFormChange('submissionType', value)} className="mt-1">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="type-online" /><Label htmlFor="type-online" className="font-normal">Online PDF</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="physical" id="type-physical" /><Label htmlFor="type-physical" className="font-normal">Physical (In School)</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="type-both" /><Label htmlFor="type-both" className="font-normal">Both (Student Choice)</Label></div>
                </RadioGroup>
            </div>
            {(currentAssignment.submissionType === 'online' || currentAssignment.submissionType === 'both') && (
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="enable-online-submission" checked={!!currentAssignment.onlineSubmissionEnabled} onCheckedChange={(checked) => handleFormChange('onlineSubmissionEnabled', !!checked)} />
                    <Label htmlFor="enable-online-submission" className="font-normal">Enable Online Submission Portal for Students</Label>
                </div>
            )}
            <div className="flex gap-2">
                <Button onClick={handleSubmitAssignment} className="flex-1">
                    {isEditing ? <Save className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                    {isEditing ? "Save Changes" : "Add Assignment"}
                </Button>
                {isEditing && <Button variant="outline" onClick={resetForm}>Cancel Edit</Button>}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Current Assignments</CardTitle>
            <CardDescription>List of assignments. Expand to view mock submissions and provide feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
            {assignments.length === 0 && <p className="text-muted-foreground text-center py-4">No assignments created yet.</p>}
            {assignments.map(assignment => {
              const submissionsForThisAssignment = getSubmissionsForAssignment(assignment.id);
              const isExpanded = viewingSubmissionsFor === assignment.id;
              return (
                <Card key={assignment.id} className="bg-card border">
                  <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleViewSubmissions(assignment.id)}>
                      <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <div className="flex gap-1 items-center">
                              <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={(e) => { e.stopPropagation(); toggleViewSubmissions(assignment.id); }}>
                                  {isExpanded ? <EyeOff className="mr-1 h-3 w-3"/> : <Eye className="mr-1 h-3 w-3"/>}
                                  Submissions ({submissionsForThisAssignment.length})
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleEditAssignment(assignment);}}><Edit className="h-4 w-4"/></Button>
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4"/></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                      <AlertDialogHeader><AlertDialogTitle>Delete Assignment?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{assignment.title}"? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteAssignment(assignment.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                          </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                          Due: {format(parseISO(assignment.dueDate), "PPP")} | 
                          Targets: {(assignment.targetGradeIds.map(id => studyGrades.find(g => g.id === id)?.name).filter(Boolean).join(', ')) || "N/A"} |
                          Created: {format(parseISO(assignment.createdAt), "Pp")}
                      </p>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm whitespace-pre-wrap">{assignment.description}</p>
                    <div className="mt-2 text-xs">
                      <span className="font-semibold">Submission:</span>
                      <span className="capitalize ml-1">{assignment.submissionType}. </span>
                      { (assignment.submissionType === 'online' || assignment.submissionType === 'both') && 
                          (assignment.onlineSubmissionEnabled ? 
                              <span className="text-green-600 dark:text-green-400">(Online Portal Enabled)</span> : 
                              <span className="text-red-600 dark:text-red-400">(Online Portal Disabled)</span>
                          )
                      }
                    </div>
                  </CardContent>
                  {isExpanded && (
                    <CardContent className="pt-3 border-t">
                      <h4 className="text-md font-semibold mb-2">Submissions for "{assignment.title}"</h4>
                      {submissionsForThisAssignment.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No submissions (mock or real) for this assignment yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {submissionsForThisAssignment.map(sub => {
                            const currentEdit = editingSubmissionStates[sub.id] || {};
                            return (
                              <Card key={sub.id} className="p-3 bg-secondary/30">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="text-sm font-medium">{sub.studentName}</p>
                                  <p className="text-xs text-muted-foreground">Submitted: {format(parseISO(sub.submittedAt), "Pp")}</p>
                                </div>
                                <a href="#" onClick={(e)=>e.preventDefault()} className="text-xs text-primary hover:underline block mb-2">
                                  <FileText className="inline-block mr-1 h-3 w-3" /> {sub.submittedContentLink || "No file link"}
                                </a>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor={`marks-${sub.id}`} className="text-xs">Marks</Label>
                                    <Input 
                                      id={`marks-${sub.id}`} 
                                      placeholder="e.g., 85/100 or A+" 
                                      value={currentEdit.marks !== undefined ? currentEdit.marks : (sub.marks || "")}
                                      onChange={(e) => handleSubmissionEditChange(sub.id, 'marks', e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`status-${sub.id}`} className="text-xs">Status</Label>
                                    <Select 
                                      value={currentEdit.status || sub.status} 
                                      onValueChange={(val) => handleSubmissionEditChange(sub.id, 'status', val as Submission['status'])}
                                    >
                                      <SelectTrigger className="h-8 text-sm"><SelectValue/></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending_review">Pending Review</SelectItem>
                                        <SelectItem value="graded">Graded</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <Label htmlFor={`remarks-${sub.id}`} className="text-xs">Remarks</Label>
                                  <Textarea 
                                    id={`remarks-${sub.id}`} 
                                    placeholder="Feedback for student..." 
                                    rows={2} 
                                    value={currentEdit.remarks !== undefined ? currentEdit.remarks : (sub.remarks || "")}
                                    onChange={(e) => handleSubmissionEditChange(sub.id, 'remarks', e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                                {(currentEdit.status || sub.status) === 'rejected' && (
                                  <div className="mt-2">
                                    <Label htmlFor={`rejection-${sub.id}`} className="text-xs">Rejection Reason</Label>
                                    <Textarea 
                                      id={`rejection-${sub.id}`} 
                                      placeholder="Reason for rejection..." 
                                      rows={2} 
                                      value={currentEdit.rejectionReason !== undefined ? currentEdit.rejectionReason : (sub.rejectionReason || "")}
                                      onChange={(e) => handleSubmissionEditChange(sub.id, 'rejectionReason', e.target.value)}
                                      className="text-sm border-destructive/50"
                                    />
                                  </div>
                                )}
                                <Button size="sm" onClick={() => handleSaveSubmissionFeedback(sub.id)} className="mt-3 text-xs h-8" disabled={Object.keys(currentEdit).length === 0}>
                                  <Send className="mr-1 h-3 w-3"/> Save Feedback
                                </Button>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </CardContent>
          {/* Footer for global save buttons can remain if other top-level saves are needed, or be removed if all saves are now granular */}
        </Card>
      </div>
    </div>
  );
}
