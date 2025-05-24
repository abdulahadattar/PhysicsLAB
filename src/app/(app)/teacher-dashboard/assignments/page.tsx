
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
import { format, parseISO, isValid, addDays, subDays, isAfter } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ASSIGNMENTS_STORAGE_KEY = 'physicsLabAssignments';
const ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY = 'physicsLabAssignmentSubmissions';

// Mock students for generating diverse mock submissions
const MOCK_STUDENTS = [
  { id: 'std_001', name: 'Aisha Khan' },
  { id: 'std_002', name: 'Bilal Ahmed' },
  { id: 'std_003', name: 'Fatima Ali' },
  { id: 'std_004', name: 'Usman Tariq' },
  { id: 'std_005', name: 'Zoya Malik' },
];

export default function ManageAssignmentsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);

  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({
    title: "",
    description: "",
    targetGradeIds: [],
    dueDate: undefined, // Will be ISO string in Assignment, Date object in form
    submissionType: "online", // Default value
    onlineSubmissionEnabled: true, // Default value
  });
  const [isEditingId, setIsEditingId] = useState<string | null>(null); // Stores ID of assignment being edited
  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState<string | null>(null);
  const [editingSubmissionStates, setEditingSubmissionStates] = useState<Record<string, Partial<Submission>>>({});

  const resetForm = useCallback(() => {
    setCurrentAssignment({
      title: "",
      description: "",
      targetGradeIds: [],
      dueDate: undefined,
      submissionType: "online",
      onlineSubmissionEnabled: true,
    });
    setIsEditingId(null);
  }, []);

  const fetchGrades = useCallback(async () => {
    setIsLoadingGrades(true);
    try {
      const res = await fetch('/api/study-materials');
      if (!res.ok) throw new Error('Failed to fetch grades');
      const data: StudyGrade[] = await res.json();
      setStudyGrades(data);
    } catch (e) {
      console.error("Error fetching study grades:", e);
      toast({ title: "Error", description: "Could not load grades for assignment targeting.", variant: "destructive" });
    }
    setIsLoadingGrades(false);
  }, [toast]);

  const loadDataFromStorage = useCallback(() => {
    try {
      const storedAssignments = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      const loadedAssignments = storedAssignments ? JSON.parse(storedAssignments) : [];
      setAssignments(loadedAssignments.sort((a: Assignment, b: Assignment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      const storedSubmissions = localStorage.getItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY);
      const loadedSubmissions = storedSubmissions ? JSON.parse(storedSubmissions) : [];
      setAllSubmissions(loadedSubmissions);
    } catch (e) {
      console.error("Error loading data from localStorage:", e);
      toast({ title: "Error Loading Data", description: "Could not load saved assignments or submissions.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchGrades();
    loadDataFromStorage();
  }, [fetchGrades, loadDataFromStorage]);

  const saveAssignmentsToStorage = useCallback(() => {
    setIsSavingAssignments(true);
    try {
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
      toast({ title: "Assignments Saved", description: "Assignment changes have been saved locally." });
    } catch (e) {
      console.error("Error saving assignments:", e);
      toast({ title: "Save Failed", description: "Could not save assignments.", variant: "destructive" });
    }
    setIsSavingAssignments(false);
  }, [assignments, toast]);

  const saveSubmissionsToStorage = useCallback(() => {
    try {
      localStorage.setItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY, JSON.stringify(allSubmissions));
    } catch (e) {
      console.error("Error saving submissions:", e);
      toast({ title: "Submission Save Failed", description: "Could not save submission data to local storage.", variant: "destructive" });
    }
  }, [allSubmissions, toast]);

  const handleFormChange = (field: keyof Omit<Assignment, 'id' | 'createdAt' | 'dueDate'> | 'dueDate', value: any) => {
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

    let updatedAssignmentsList;
    const assignmentPayload = {
      ...currentAssignment,
      dueDate: currentAssignment.dueDate, // Already ISO string or Date object
      submissionType: currentAssignment.submissionType as Assignment['submissionType'],
      targetGradeIds: currentAssignment.targetGradeIds as string[],
      onlineSubmissionEnabled: currentAssignment.onlineSubmissionEnabled === undefined ? (currentAssignment.submissionType !== 'physical') : currentAssignment.onlineSubmissionEnabled,
      title: currentAssignment.title as string,
      description: currentAssignment.description as string,
    };


    if (isEditingId) {
      updatedAssignmentsList = assignments.map(a => 
        a.id === isEditingId ? { ...a, ...assignmentPayload } as Assignment : a
      );
      toast({ title: "Assignment Updated", description: `"${assignmentPayload.title}" has been updated.` });
    } else {
      const newAssignment: Assignment = {
        id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        ...assignmentPayload,
      } as Assignment; // Cast to full Assignment type
      updatedAssignmentsList = [newAssignment, ...assignments];
      toast({ title: "Assignment Added", description: `"${newAssignment.title}" has been added.` });
    }
    
    const sortedAssignments = updatedAssignmentsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAssignments(sortedAssignments);
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(sortedAssignments));
    resetForm();
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setIsEditingId(assignment.id);
    // Ensure dueDate is an ISO string for the state, calendar will parse it
    setCurrentAssignment({ 
      ...assignment, 
      dueDate: assignment.dueDate // Keep as ISO string
    });
    setViewingSubmissionsFor(null);
  };

  const handleDeleteAssignment = (id: string) => {
    const newAssignments = assignments.filter(a => a.id !== id);
    setAssignments(newAssignments);
    const newSubmissions = allSubmissions.filter(s => s.assignmentId !== id);
    setAllSubmissions(newSubmissions);
    
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(newAssignments));
    localStorage.setItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY, JSON.stringify(newSubmissions));

    toast({ title: "Assignment Deleted", description: "The assignment and its submissions have been removed." });
    if (viewingSubmissionsFor === id) {
        setViewingSubmissionsFor(null);
    }
    if (isEditingId === id) { // If deleting the assignment currently being edited, reset form
      resetForm();
    }
  };

  const toggleViewSubmissions = (assignmentId: string) => {
    setViewingSubmissionsFor(prev => {
      if (prev === assignmentId) return null;

      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) return prev;

      const existingSubmissionsForThisAssignment = allSubmissions.filter(s => s.assignmentId === assignmentId);
      if (existingSubmissionsForThisAssignment.length === 0 && MOCK_STUDENTS.length > 0) {
        const numberOfMockSubmissions = Math.floor(Math.random() * MOCK_STUDENTS.length) + 1;
        const shuffledStudents = [...MOCK_STUDENTS].sort(() => 0.5 - Math.random());
        
        const newMockSubmissions: Submission[] = shuffledStudents.slice(0, numberOfMockSubmissions)
          .map((student, index) => ({
            id: `sub_${assignmentId}_${student.id}_${Date.now() + index}`,
            assignmentId: assignmentId,
            studentId: student.id,
            studentName: student.name,
            submittedAt: subDays(parseISO(assignment.dueDate), Math.floor(Math.random() * 3)).toISOString(),
            submittedContentLink: `submission_${student.name.replace(/\s+/g, '_')}_${assignment.title.substring(0,10).replace(/\s+/g, '_')}.pdf`,
            status: 'pending_review' as Submission['status'],
            marks: '',
            remarks: '',
            rejectionReason: '',
          }));
        
        setAllSubmissions(prevSubs => {
            const updated = [...prevSubs, ...newMockSubmissions];
            localStorage.setItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
      }
      return assignmentId;
    });
  };
  
  const handleSubmissionEditChange = (submissionId: string, field: keyof Submission, value: string | number | boolean) => {
    setEditingSubmissionStates(prev => ({
      ...prev,
      [submissionId]: {
        ...(prev[submissionId] || {}),
        [field]: value,
      }
    }));
  };

  const handleSaveSubmissionFeedback = (submissionId: string) => {
    const editedFields = editingSubmissionStates[submissionId];
    if (!editedFields || Object.keys(editedFields).length === 0) {
        toast({title: "No Changes", description: "No changes to save for this submission.", variant: "default"});
        return;
    }

    setAllSubmissions(prev => {
        const updated = prev.map(sub => 
            sub.id === submissionId ? { ...sub, ...editedFields } : sub
        );
        localStorage.setItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
    
    setEditingSubmissionStates(prev => {
      const newState = {...prev};
      delete newState[submissionId];
      return newState;
    });
    toast({ title: "Feedback Saved", description: `Feedback for submission ${submissionId.substring(0, 8)}... has been saved.` });
  };
  
  const getSubmissionsForAssignment = (assignmentId: string) => {
    return allSubmissions.filter(s => s.assignmentId === assignmentId);
  };
  
  // Helper to get Date object for calendar from ISO string
  const getCalendarDate = (isoDateString?: string): Date | undefined => {
    if (!isoDateString) return undefined;
    const date = parseISO(isoDateString);
    return isValid(date) ? date : undefined;
  };


  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl"><Edit className="h-7 w-7 text-primary"/>Manage Assignments</CardTitle>
          <CardDescription>Create, edit, and manage assignments. View mock submissions and provide feedback. Changes are saved locally to your browser.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">{isEditingId ? "Edit Assignment" : "Create New Assignment"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="assignment-title">Title <span className="text-destructive">*</span></Label>
              <Input id="assignment-title" value={currentAssignment.title || ""} onChange={e => handleFormChange('title', e.target.value)} placeholder="E.g., Chapter 3 Problems" />
            </div>
            <div>
              <Label htmlFor="assignment-description">Description <span className="text-destructive">*</span></Label>
              <Textarea id="assignment-description" value={currentAssignment.description || ""} onChange={e => handleFormChange('description', e.target.value)} placeholder="Details about the assignment..." rows={3}/>
            </div>
            <div>
                <Label>Target Grade(s) <span className="text-destructive">*</span></Label>
                {isLoadingGrades ? <div className="py-2"><Loader2 className="h-4 w-4 animate-spin"/></div> : studyGrades.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1 p-3 border rounded-md max-h-36 overflow-y-auto bg-background">
                        {studyGrades.map(grade => (
                            <div key={grade.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`grade-${grade.id}`}
                                    checked={(currentAssignment.targetGradeIds || []).includes(grade.id)}
                                    onCheckedChange={(checked) => handleTargetGradeChange(grade.id, !!checked)}
                                />
                                <Label htmlFor={`grade-${grade.id}`} className="font-normal text-sm cursor-pointer">{grade.name}</Label>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-xs text-muted-foreground mt-1">No grades loaded for selection.</p>}
            </div>
            <div>
              <Label htmlFor="assignment-due-date">Due Date <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal h-10"
                    id="assignment-due-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentAssignment.dueDate ? format(parseISO(currentAssignment.dueDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={getCalendarDate(currentAssignment.dueDate)}
                    onSelect={(date) => handleFormChange('dueDate', date ? date.toISOString() : undefined)}
                    initialFocus
                    disabled={(date) => !isEditingId && isAfter(new Date(new Date().toDateString()), date) /* Disable past dates for new assignments only */}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
                <Label>Submission Type <span className="text-destructive">*</span></Label>
                <RadioGroup 
                    value={currentAssignment.submissionType || "online"} 
                    onValueChange={(value) => handleFormChange('submissionType', value as Assignment['submissionType'])} 
                    className="mt-1 space-y-1"
                >
                    <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="type-online" /><Label htmlFor="type-online" className="font-normal text-sm">Online PDF Link</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="physical" id="type-physical" /><Label htmlFor="type-physical" className="font-normal text-sm">Physical (In School)</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="type-both" /><Label htmlFor="type-both" className="font-normal text-sm">Both (Student Choice)</Label></div>
                </RadioGroup>
            </div>
            {(currentAssignment.submissionType === 'online' || currentAssignment.submissionType === 'both') && (
                <div className="flex items-center space-x-2 pt-1">
                    <Checkbox 
                        id="enable-online-submission" 
                        checked={currentAssignment.onlineSubmissionEnabled === undefined ? true : !!currentAssignment.onlineSubmissionEnabled}
                        onCheckedChange={(checked) => handleFormChange('onlineSubmissionEnabled', !!checked)} 
                    />
                    <Label htmlFor="enable-online-submission" className="font-normal text-sm">Enable Online Submission Portal for Students</Label>
                </div>
            )}
            <div className="flex gap-2 pt-2">
                <Button onClick={handleSubmitAssignment} className="flex-1">
                    {isEditingId ? <Save className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                    {isEditingId ? "Save Changes" : "Add Assignment"}
                </Button>
                {isEditingId && <Button variant="outline" onClick={resetForm} className="flex-shrink-0">Cancel Edit</Button>}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Current Assignments ({assignments.length})</CardTitle>
            <CardDescription>List of all created assignments. Click an assignment to manage its submissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {assignments.length === 0 && <p className="text-muted-foreground text-center py-6">No assignments created yet. Add one using the form on the left.</p>}
            {assignments.map(assignment => {
              const submissionsForThisAssignment = getSubmissionsForAssignment(assignment.id);
              const isExpanded = viewingSubmissionsFor === assignment.id;
              const dueDate = parseISO(assignment.dueDate);
              const isPastDue = isAfter(new Date(), dueDate) && format(dueDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd');

              return (
                <Card key={assignment.id} className="bg-card border transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2 cursor-pointer group" onClick={() => toggleViewSubmissions(assignment.id)}>
                      <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-lg group-hover:text-primary">{assignment.title}</CardTitle>
                          <div className="flex gap-1 items-center flex-shrink-0">
                              <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={(e) => { e.stopPropagation(); toggleViewSubmissions(assignment.id); }}>
                                  {isExpanded ? <EyeOff className="mr-1 h-3 w-3"/> : <Eye className="mr-1 h-3 w-3"/>}
                                  Submissions ({submissionsForThisAssignment.length})
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleEditAssignment(assignment);}} aria-label="Edit Assignment"><Edit className="h-4 w-4"/></Button>
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()} aria-label="Delete Assignment"><Trash2 className="h-4 w-4"/></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent onClick={(e) => e.stopPropagation()}> {/* Prevent accordion toggle */}
                                      <AlertDialogHeader><AlertDialogTitle>Delete Assignment?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{assignment.title}"? This action will also remove all associated student submissions and cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteAssignment(assignment.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                          </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                          <span className={isPastDue ? "text-destructive font-semibold" : ""}>Due: {format(dueDate, "PPP")} {isPastDue ? "(Past Due)" : ""}</span> | 
                          Targets: {(assignment.targetGradeIds.map(id => studyGrades.find(g => g.id === id)?.name).filter(Boolean).join(', ')) || "N/A"} |
                          Created: {assignment.createdAt ? format(parseISO(assignment.createdAt), "MMM d, yyyy") : "N/A"}
                      </p>
                  </CardHeader>
                  <CardContent className="pb-3 pt-1">
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{assignment.description}</p>
                    <div className="mt-1 text-xs">
                      <span className="font-semibold">Submission:</span>
                      <span className="capitalize ml-1">{assignment.submissionType.replace('_', ' / ')}. </span>
                      { (assignment.submissionType === 'online' || assignment.submissionType === 'both') && 
                          (assignment.onlineSubmissionEnabled ? 
                              <span className="text-green-600 dark:text-green-400">(Online Portal Enabled)</span> : 
                              <span className="text-red-600 dark:text-red-400">(Online Portal Disabled)</span>
                          )
                      }
                    </div>
                  </CardContent>
                  {isExpanded && (
                    <CardContent className="pt-3 border-t bg-secondary/20">
                      <h4 className="text-md font-semibold mb-3">Submissions for "{assignment.title}"</h4>
                      {submissionsForThisAssignment.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-3 text-center">No submissions (mock or real) for this assignment yet.</p>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                          {submissionsForThisAssignment.map(sub => {
                            const currentEdit = editingSubmissionStates[sub.id] || {};
                            return (
                              <Card key={sub.id} className="p-3 bg-background shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                  <p className="text-sm font-medium">{sub.studentName || `Student ID: ${sub.studentId}`}</p>
                                  <p className="text-xs text-muted-foreground">Submitted: {sub.submittedAt ? format(parseISO(sub.submittedAt), "Pp") : "N/A"}</p>
                                </div>
                                {sub.submittedContentLink && 
                                    <a href={sub.submittedContentLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block mb-2 flex items-center">
                                        <FileText className="inline-block mr-1 h-3 w-3" /> {sub.submittedContentLink.substring(sub.submittedContentLink.lastIndexOf('/') + 1) || "View Linked File"}
                                    </a>
                                }
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                                  <div>
                                    <Label htmlFor={`marks-${sub.id}`} className="text-xs mb-0.5 block">Marks</Label>
                                    <Input 
                                      id={`marks-${sub.id}`} 
                                      placeholder="e.g., 85/100 or A+" 
                                      value={currentEdit.marks !== undefined ? String(currentEdit.marks) : (sub.marks || "")}
                                      onChange={(e) => handleSubmissionEditChange(sub.id, 'marks', e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`status-${sub.id}`} className="text-xs mb-0.5 block">Status</Label>
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
                                <div>
                                  <Label htmlFor={`remarks-${sub.id}`} className="text-xs mb-0.5 block">Remarks/Feedback</Label>
                                  <Textarea 
                                    id={`remarks-${sub.id}`} 
                                    placeholder="Provide feedback to the student..." 
                                    rows={2} 
                                    value={currentEdit.remarks !== undefined ? currentEdit.remarks : (sub.remarks || "")}
                                    onChange={(e) => handleSubmissionEditChange(sub.id, 'remarks', e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                                {((currentEdit.status || sub.status) === 'rejected') && (
                                  <div className="mt-2">
                                    <Label htmlFor={`rejection-${sub.id}`} className="text-xs text-destructive mb-0.5 block">Rejection Reason</Label>
                                    <Textarea 
                                      id={`rejection-${sub.id}`} 
                                      placeholder="Reason for rejection (if applicable)..." 
                                      rows={2} 
                                      value={currentEdit.rejectionReason !== undefined ? currentEdit.rejectionReason : (sub.rejectionReason || "")}
                                      onChange={(e) => handleSubmissionEditChange(sub.id, 'rejectionReason', e.target.value)}
                                      className="text-sm border-destructive/50"
                                    />
                                  </div>
                                )}
                                <Button size="sm" onClick={() => handleSaveSubmissionFeedback(sub.id)} className="mt-3 text-xs h-8" disabled={Object.keys(currentEdit).length === 0}>
                                  <Send className="mr-1 h-3 w-3"/> Save Submission Feedback
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
          <CardFooter className="border-t pt-4">
             <Button onClick={saveAssignmentsToStorage} disabled={isSavingAssignments || assignments.length === 0} className="w-full">
              {isSavingAssignments ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
              Save All Assignment Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
```Okay, I've enhanced the Teacher Assignment Management page (`src/app/(app)/teacher-dashboard/assignments/page.tsx`) to include **Edit Assignment** functionality and made the overall interaction and data persistence with `localStorage` more robust.

Here’s a summary of the key changes:

1.  **State Management for Editing:**
    *   A new state variable `isEditingId: string | null` is introduced. It stores the `id` of the assignment currently being edited. If `null`, the form is in "create new" mode.
    *   The `resetForm` function now also clears `isEditingId`.

2.  **Edit Assignment Workflow:**
    *   When the "Edit" icon on an assignment card is clicked, `handleEditAssignment` is called.
        *   This function sets `isEditingId` to the ID of the selected assignment.
        *   It populates the `currentAssignment` state (the form fields) with the data from the assignment being edited. Due dates are correctly handled as ISO strings in the state.
        *   The form's submit button text changes from "Add Assignment" to "Save Changes".
    *   The `handleSubmitAssignment` function now checks `isEditingId`:
        *   If `isEditingId` has a value, it maps over the `assignments` array and updates the assignment with the matching ID using the data from `currentAssignment`.
        *   If `isEditingId` is `null`, it creates a new assignment as before.
    *   After saving changes or adding a new assignment, `resetForm` is called to clear the form and `isEditingId`.
    *   Assignments are now saved to `localStorage` immediately after the `assignments` state is updated by `handleSubmitAssignment` or `handleDeleteAssignment`.

3.  **Form Initialization and Reset:**
    *   The `currentAssignment` state is now initialized with default values for `title`, `description`, `targetGradeIds`, `submissionType`, and `onlineSubmissionEnabled` to ensure controlled inputs and a consistent starting point for new assignments.
    *   `resetForm` ensures all these fields are cleared when an assignment is added/edited or when "Cancel Edit" is clicked.

4.  **Improved Due Date Handling:**
    *   The `currentAssignment.dueDate` is stored as an ISO string.
    *   A helper `getCalendarDate` converts this ISO string to a `Date` object for the `Calendar` component's `selected` prop.
    *   The `Calendar`'s `onSelect` prop updates `currentAssignment.dueDate` with a new ISO string.
    *   The `disabled` prop for the `Calendar` now correctly prevents selecting past dates for *new* assignments but allows them if an assignment is being edited (to preserve or slightly adjust an existing past due date).

5.  **Local Storage Persistence:**
    *   `saveAssignmentsToStorage` (manual save button) and `saveSubmissionsToStorage` are now `useCallback` memoized.
    *   Saving of the main `assignments` list is primarily handled by `handleSubmitAssignment` and `handleDeleteAssignment` directly after the `assignments` state is updated. The global "Save All Assignment Changes" button in the footer remains as a manual overall save if needed.
    *   When deleting an assignment, associated submissions are now also filtered out from `allSubmissions` and `localStorage` is updated for both.
    *   If an assignment being edited is deleted, the form resets.

6.  **Mock Submission Generation Refined:**
    *   The `toggleViewSubmissions` function, when generating mock submissions, now shuffles the `MOCK_STUDENTS` list and picks a random number of students to create more varied mock submission scenarios for each assignment. It also saves these new mock submissions to `localStorage` immediately.

7.  **UI/UX Tweaks:**
    *   Labels for form fields in the assignment creation/edit card are more consistent.
    *   Target Grade checkboxes now use `!!checked` for `onCheckedChange`.
    *   The "Enable Online Submission Portal" checkbox logic is robust, defaulting to `true` if `currentAssignment.onlineSubmissionEnabled` is undefined for a new assignment.
    *   The list of assignments (`Current Assignments` card) is now wrapped in `max-h-[calc(100vh-200px)] overflow-y-auto pr-2` for better scrolling on smaller screens.
    *   Input fields for submission marks and remarks have their `value` props correctly tied to either the current edit state (`editingSubmissionStates`) or the base submission data.
    *   The "Save Submission Feedback" button is disabled if no changes have been made to that submission's editable fields.
    *   Clicking anywhere on the `AlertDialogContent` now stops event propagation to prevent the underlying accordion from toggling.
    *   The `createdAt` field is now consistently formatted in the assignment card.
    *   The "Submission Type" radio group now correctly defaults to "online" and the label for "Online PDF Link" matches the updated submission approach.

These changes make the assignment management feature significantly more complete and robust, with a proper edit workflow and reliable local data persistence for both assignments and their mock submissions.

```xml
<changes>
  <description>Enhance Teacher Assignment Management: Add Edit functionality, ensure robust localStorage persistence for assignments and submissions, and improve clarity for managing submissions. Due date handling, form resets, and UI consistency are also improved.</description>
  <change>
    <file>/src/app/(app)/teacher-dashboard/assignments/page.tsx</file>
    <content><![CDATA[
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
import { format, parseISO, isValid, addDays, subDays, isAfter } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ASSIGNMENTS_STORAGE_KEY = 'physicsLabAssignments';
const ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY = 'physicsLabAssignmentSubmissions';

// Mock students for generating diverse mock submissions
const MOCK_STUDENTS = [
  { id: 'std_001', name: 'Aisha Khan' },
  { id: 'std_002', name: 'Bilal Ahmed' },
  { id: 'std_003', name: 'Fatima Ali' },
  { id: 'std_004', name: 'Usman Tariq' },
  { id: 'std_005', name: 'Zoya Malik' },
];

export default function ManageAssignmentsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);

  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({
    title: "",
    description: "",
    targetGradeIds: [],
    dueDate: undefined, // Will be ISO string in Assignment, Date object in form
    submissionType: "online", // Default value
    onlineSubmissionEnabled: true, // Default value
  });
  const [isEditingId, setIsEditingId] = useState<string | null>(null); // Stores ID of assignment being edited
  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState<string | null>(null);
  const [editingSubmissionStates, setEditingSubmissionStates] = useState<Record<string, Partial<Submission>>>({});

  const resetForm = useCallback(() => {
    setCurrentAssignment({
      title: "",
      description: "",
      targetGradeIds: [],
      dueDate: undefined,
      submissionType: "online",
      onlineSubmissionEnabled: true,
    });
    setIsEditingId(null);
  }, []);

  const fetchGrades = useCallback(async () => {
    setIsLoadingGrades(true);
    try {
      const res = await fetch('/api/study-materials');
      if (!res.ok) throw new Error('Failed to fetch grades');
      const data: StudyGrade[] = await res.json();
      setStudyGrades(data);
    } catch (e) {
      console.error("Error fetching study grades:", e);
      toast({ title: "Error", description: "Could not load grades for assignment targeting.", variant: "destructive" });
    }
    setIsLoadingGrades(false);
  }, [toast]);

  const loadDataFromStorage = useCallback(() => {
    try {
      const storedAssignments = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      const loadedAssignments = storedAssignments ? JSON.parse(storedAssignments) : [];
      setAssignments(loadedAssignments.sort((a: Assignment, b: Assignment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      const storedSubmissions = localStorage.getItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY);
      const loadedSubmissions = storedSubmissions ? JSON.parse(storedSubmissions) : [];
      setAllSubmissions(loadedSubmissions);
    } catch (e) {
      console.error("Error loading data from localStorage:", e);
      toast({ title: "Error Loading Data", description: "Could not load saved assignments or submissions.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchGrades();
    loadDataFromStorage();
  }, [fetchGrades, loadDataFromStorage]);

  const saveAssignmentsToStorage = useCallback(() => {
    setIsSavingAssignments(true);
    try {
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
      toast({ title: "Assignments Saved", description: "Assignment changes have been saved locally." });
    } catch (e) {
      console.error("Error saving assignments:", e);
      toast({ title: "Save Failed", description: "Could not save assignments.", variant: "destructive" });
    }
    setIsSavingAssignments(false);
  }, [assignments, toast]);

  const saveSubmissionsToStorage = useCallback(() => {
    try {
      localStorage.setItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY, JSON.stringify(allSubmissions));
    } catch (e) {
      console.error("Error saving submissions:", e);
      toast({ title: "Submission Save Failed", description: "Could not save submission data to local storage.", variant: "destructive" });
    }
  }, [allSubmissions, toast]);

  const handleFormChange = (field: keyof Omit<Assignment, 'id' | 'createdAt' | 'dueDate'> | 'dueDate', value: any) => {
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

    let updatedAssignmentsList;
    const assignmentPayload = {
      ...currentAssignment,
      dueDate: currentAssignment.dueDate, // Already ISO string
      submissionType: currentAssignment.submissionType as Assignment['submissionType'],
      targetGradeIds: currentAssignment.targetGradeIds as string[],
      onlineSubmissionEnabled: currentAssignment.onlineSubmissionEnabled === undefined ? (currentAssignment.submissionType !== 'physical') : currentAssignment.onlineSubmissionEnabled,
      title: currentAssignment.title as string,
      description: currentAssignment.description as string,
    };


    if (isEditingId) {
      updatedAssignmentsList = assignments.map(a => 
        a.id === isEditingId ? { ...a, ...assignmentPayload } as Assignment : a
      );
      toast({ title: "Assignment Updated", description: `"${assignmentPayload.title}" has been updated.` });
    } else {
      const newAssignment: Assignment = {
        id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        ...assignmentPayload,
      } as Assignment; // Cast to full Assignment type
      updatedAssignmentsList = [newAssignment, ...assignments];
      toast({ title: "Assignment Added", description: `"${newAssignment.title}" has been added.` });
    }
    
    const sortedAssignments = updatedAssignmentsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAssignments(sortedAssignments);
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(sortedAssignments));
    resetForm();
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setIsEditingId(assignment.id);
    // Ensure dueDate is an ISO string for the state, calendar will parse it
    setCurrentAssignment({ 
      ...assignment, 
      dueDate: assignment.dueDate // Keep as ISO string
    });
    setViewingSubmissionsFor(null);
  };

  const handleDeleteAssignment = (id: string) => {
    const newAssignments = assignments.filter(a => a.id !== id);
    setAssignments(newAssignments);
    const newSubmissions = allSubmissions.filter(s => s.assignmentId !== id);
    setAllSubmissions(newSubmissions);
    
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(newAssignments));
    localStorage.setItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY, JSON.stringify(newSubmissions));

    toast({ title: "Assignment Deleted", description: "The assignment and its submissions have been removed." });
    if (viewingSubmissionsFor === id) {
        setViewingSubmissionsFor(null);
    }
    if (isEditingId === id) { // If deleting the assignment currently being edited, reset form
      resetForm();
    }
  };

  const toggleViewSubmissions = (assignmentId: string) => {
    setViewingSubmissionsFor(prev => {
      if (prev === assignmentId) return null;

      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) return prev;

      const existingSubmissionsForThisAssignment = allSubmissions.filter(s => s.assignmentId === assignmentId);
      if (existingSubmissionsForThisAssignment.length === 0 && MOCK_STUDENTS.length > 0) {
        const numberOfMockSubmissions = Math.floor(Math.random() * MOCK_STUDENTS.length) + 1;
        const shuffledStudents = [...MOCK_STUDENTS].sort(() => 0.5 - Math.random());
        
        const newMockSubmissions: Submission[] = shuffledStudents.slice(0, numberOfMockSubmissions)
          .map((student, index) => ({
            id: `sub_${assignmentId}_${student.id}_${Date.now() + index}`,
            assignmentId: assignmentId,
            studentId: student.id,
            studentName: student.name,
            submittedAt: subDays(parseISO(assignment.dueDate), Math.floor(Math.random() * 3)).toISOString(),
            submittedContentLink: `submission_${student.name.replace(/\s+/g, '_')}_${assignment.title.substring(0,10).replace(/\s+/g, '_')}.pdf`, // Mock link
            status: 'pending_review' as Submission['status'],
            marks: '',
            remarks: '',
            rejectionReason: '',
          }));
        
        setAllSubmissions(prevSubs => {
            const updated = [...prevSubs, ...newMockSubmissions];
            localStorage.setItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
      }
      return assignmentId;
    });
  };
  
  const handleSubmissionEditChange = (submissionId: string, field: keyof Submission, value: string | number | boolean) => {
    setEditingSubmissionStates(prev => ({
      ...prev,
      [submissionId]: {
        ...(prev[submissionId] || {}), // Ensure existing edits are kept
        [field]: value,
      }
    }));
  };

  const handleSaveSubmissionFeedback = (submissionId: string) => {
    const editedFields = editingSubmissionStates[submissionId];
    if (!editedFields || Object.keys(editedFields).length === 0) {
        toast({title: "No Changes", description: "No changes to save for this submission.", variant: "default"});
        return;
    }

    setAllSubmissions(prev => {
        const updated = prev.map(sub => 
            sub.id === submissionId ? { ...sub, ...editedFields } : sub
        );
        localStorage.setItem(ASSIGNMENTS_SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
    
    setEditingSubmissionStates(prev => {
      const newState = {...prev};
      delete newState[submissionId];
      return newState;
    });
    toast({ title: "Feedback Saved", description: `Feedback for submission ${submissionId.substring(0, 8)}... has been saved.` });
  };
  
  const getSubmissionsForAssignment = (assignmentId: string) => {
    return allSubmissions.filter(s => s.assignmentId === assignmentId);
  };
  
  // Helper to get Date object for calendar from ISO string
  const getCalendarDate = (isoDateString?: string): Date | undefined => {
    if (!isoDateString) return undefined;
    const date = parseISO(isoDateString);
    return isValid(date) ? date : undefined;
  };


  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl"><Edit className="h-7 w-7 text-primary"/>Manage Assignments</CardTitle>
          <CardDescription>Create, edit, and manage assignments. View mock submissions and provide feedback. Changes are saved locally to your browser.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">{isEditingId ? "Edit Assignment" : "Create New Assignment"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="assignment-title">Title <span className="text-destructive">*</span></Label>
              <Input id="assignment-title" value={currentAssignment.title || ""} onChange={e => handleFormChange('title', e.target.value)} placeholder="E.g., Chapter 3 Problems" />
            </div>
            <div>
              <Label htmlFor="assignment-description">Description <span className="text-destructive">*</span></Label>
              <Textarea id="assignment-description" value={currentAssignment.description || ""} onChange={e => handleFormChange('description', e.target.value)} placeholder="Details about the assignment..." rows={3}/>
            </div>
            <div>
                <Label>Target Grade(s) <span className="text-destructive">*</span></Label>
                {isLoadingGrades ? <div className="py-2"><Loader2 className="h-4 w-4 animate-spin"/></div> : studyGrades.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1 p-3 border rounded-md max-h-36 overflow-y-auto bg-background">
                        {studyGrades.map(grade => (
                            <div key={grade.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`grade-${grade.id}`}
                                    checked={(currentAssignment.targetGradeIds || []).includes(grade.id)}
                                    onCheckedChange={(checked) => handleTargetGradeChange(grade.id, !!checked)}
                                />
                                <Label htmlFor={`grade-${grade.id}`} className="font-normal text-sm cursor-pointer">{grade.name}</Label>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-xs text-muted-foreground mt-1">No grades loaded for selection.</p>}
            </div>
            <div>
              <Label htmlFor="assignment-due-date">Due Date <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal h-10"
                    id="assignment-due-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentAssignment.dueDate ? format(parseISO(currentAssignment.dueDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={getCalendarDate(currentAssignment.dueDate)}
                    onSelect={(date) => handleFormChange('dueDate', date ? date.toISOString() : undefined)}
                    initialFocus
                    disabled={(date) => !isEditingId && isAfter(new Date(new Date().setDate(new Date().getDate() -1)), date) /* Disable past dates for new assignments only, unless editing */}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
                <Label>Submission Type <span className="text-destructive">*</span></Label>
                <RadioGroup 
                    value={currentAssignment.submissionType || "online"} 
                    onValueChange={(value) => handleFormChange('submissionType', value as Assignment['submissionType'])} 
                    className="mt-1 space-y-1"
                >
                    <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="type-online" /><Label htmlFor="type-online" className="font-normal text-sm">Online PDF Link</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="physical" id="type-physical" /><Label htmlFor="type-physical" className="font-normal text-sm">Physical (In School)</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="type-both" /><Label htmlFor="type-both" className="font-normal text-sm">Both (Student Choice)</Label></div>
                </RadioGroup>
            </div>
            {(currentAssignment.submissionType === 'online' || currentAssignment.submissionType === 'both') && (
                <div className="flex items-center space-x-2 pt-1">
                    <Checkbox 
                        id="enable-online-submission" 
                        checked={currentAssignment.onlineSubmissionEnabled === undefined ? true : !!currentAssignment.onlineSubmissionEnabled}
                        onCheckedChange={(checked) => handleFormChange('onlineSubmissionEnabled', !!checked)} 
                    />
                    <Label htmlFor="enable-online-submission" className="font-normal text-sm">Enable Online Submission Portal for Students</Label>
                </div>
            )}
            <div className="flex gap-2 pt-2">
                <Button onClick={handleSubmitAssignment} className="flex-1">
                    {isEditingId ? <Save className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                    {isEditingId ? "Save Changes" : "Add Assignment"}
                </Button>
                {isEditingId && <Button variant="outline" onClick={resetForm} className="flex-shrink-0">Cancel Edit</Button>}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Current Assignments ({assignments.length})</CardTitle>
            <CardDescription>List of all created assignments. Click an assignment to manage its submissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {assignments.length === 0 && <p className="text-muted-foreground text-center py-6">No assignments created yet. Add one using the form on the left.</p>}
            {assignments.map(assignment => {
              const submissionsForThisAssignment = getSubmissionsForAssignment(assignment.id);
              const isExpanded = viewingSubmissionsFor === assignment.id;
              const dueDate = parseISO(assignment.dueDate);
              const isPastDue = isAfter(new Date(), dueDate) && format(dueDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd');

              return (
                <Card key={assignment.id} className="bg-card border transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2 cursor-pointer group" onClick={() => toggleViewSubmissions(assignment.id)}>
                      <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-lg group-hover:text-primary">{assignment.title}</CardTitle>
                          <div className="flex gap-1 items-center flex-shrink-0">
                              <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={(e) => { e.stopPropagation(); toggleViewSubmissions(assignment.id); }}>
                                  {isExpanded ? <EyeOff className="mr-1 h-3 w-3"/> : <Eye className="mr-1 h-3 w-3"/>}
                                  Submissions ({submissionsForThisAssignment.length})
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleEditAssignment(assignment);}} aria-label="Edit Assignment"><Edit className="h-4 w-4"/></Button>
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()} aria-label="Delete Assignment"><Trash2 className="h-4 w-4"/></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent onClick={(e) => e.stopPropagation()}> {/* Prevent accordion toggle */}
                                      <AlertDialogHeader><AlertDialogTitle>Delete Assignment?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{assignment.title}"? This action will also remove all associated student submissions and cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteAssignment(assignment.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                          </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                          <span className={isPastDue ? "text-destructive font-semibold" : ""}>Due: {format(dueDate, "PPP")} {isPastDue ? "(Past Due)" : ""}</span> | 
                          Targets: {(assignment.targetGradeIds.map(id => studyGrades.find(g => g.id === id)?.name).filter(Boolean).join(', ')) || "N/A"} |
                          Created: {assignment.createdAt ? format(parseISO(assignment.createdAt), "MMM d, yyyy") : "N/A"}
                      </p>
                  </CardHeader>
                  <CardContent className="pb-3 pt-1">
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{assignment.description}</p>
                    <div className="mt-1 text-xs">
                      <span className="font-semibold">Submission:</span>
                      <span className="capitalize ml-1">{assignment.submissionType.replace('_', ' / ')}. </span>
                      { (assignment.submissionType === 'online' || assignment.submissionType === 'both') && 
                          (assignment.onlineSubmissionEnabled ? 
                              <span className="text-green-600 dark:text-green-400">(Online Portal Enabled)</span> : 
                              <span className="text-red-600 dark:text-red-400">(Online Portal Disabled)</span>
                          )
                      }
                    </div>
                  </CardContent>
                  {isExpanded && (
                    <CardContent className="pt-3 border-t bg-secondary/20">
                      <h4 className="text-md font-semibold mb-3">Submissions for "{assignment.title}"</h4>
                      {submissionsForThisAssignment.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-3 text-center">No submissions (mock or real) for this assignment yet.</p>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                          {submissionsForThisAssignment.map(sub => {
                            const currentEdit = editingSubmissionStates[sub.id] || {};
                            return (
                              <Card key={sub.id} className="p-3 bg-background shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                  <p className="text-sm font-medium">{sub.studentName || `Student ID: ${sub.studentId}`}</p>
                                  <p className="text-xs text-muted-foreground">Submitted: {sub.submittedAt ? format(parseISO(sub.submittedAt), "Pp") : "N/A"}</p>
                                </div>
                                {sub.submittedContentLink && 
                                    <a href={sub.submittedContentLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block mb-2 flex items-center">
                                        <FileText className="inline-block mr-1 h-3 w-3" /> {sub.submittedContentLink.substring(sub.submittedContentLink.lastIndexOf('/') + 1) || "View Linked File"}
                                    </a>
                                }
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                                  <div>
                                    <Label htmlFor={`marks-${sub.id}`} className="text-xs mb-0.5 block">Marks</Label>
                                    <Input 
                                      id={`marks-${sub.id}`} 
                                      placeholder="e.g., 85/100 or A+" 
                                      value={currentEdit.marks !== undefined ? String(currentEdit.marks) : (sub.marks || "")}
                                      onChange={(e) => handleSubmissionEditChange(sub.id, 'marks', e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`status-${sub.id}`} className="text-xs mb-0.5 block">Status</Label>
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
                                <div>
                                  <Label htmlFor={`remarks-${sub.id}`} className="text-xs mb-0.5 block">Remarks/Feedback</Label>
                                  <Textarea 
                                    id={`remarks-${sub.id}`} 
                                    placeholder="Provide feedback to the student..." 
                                    rows={2} 
                                    value={currentEdit.remarks !== undefined ? currentEdit.remarks : (sub.remarks || "")}
                                    onChange={(e) => handleSubmissionEditChange(sub.id, 'remarks', e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                                {((currentEdit.status || sub.status) === 'rejected') && (
                                  <div className="mt-2">
                                    <Label htmlFor={`rejection-${sub.id}`} className="text-xs text-destructive mb-0.5 block">Rejection Reason</Label>
                                    <Textarea 
                                      id={`rejection-${sub.id}`} 
                                      placeholder="Reason for rejection (if applicable)..." 
                                      rows={2} 
                                      value={currentEdit.rejectionReason !== undefined ? currentEdit.rejectionReason : (sub.rejectionReason || "")}
                                      onChange={(e) => handleSubmissionEditChange(sub.id, 'rejectionReason', e.target.value)}
                                      className="text-sm border-destructive/50"
                                    />
                                  </div>
                                )}
                                <Button size="sm" onClick={() => handleSaveSubmissionFeedback(sub.id)} className="mt-3 text-xs h-8" disabled={Object.keys(currentEdit).length === 0}>
                                  <Send className="mr-1 h-3 w-3"/> Save Submission Feedback
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
          <CardFooter className="border-t pt-4">
             <Button onClick={saveAssignmentsToStorage} disabled={isSavingAssignments || assignments.length === 0} className="w-full">
              {isSavingAssignments ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
              Save All Assignment Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    