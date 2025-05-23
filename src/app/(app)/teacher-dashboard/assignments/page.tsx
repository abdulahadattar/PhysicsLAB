
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
import { CalendarIcon, PlusCircle, Trash2, Edit, Save, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Assignment, StudyGrade } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ASSIGNMENTS_STORAGE_KEY = 'physicsLabAssignments';

export default function ManageAssignmentsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for new/editing assignment
  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({});
  const [isEditing, setIsEditing] = useState<string | null>(null); // Stores ID of assignment being edited

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

  const loadAssignments = useCallback(() => {
    try {
      const storedData = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      const loadedAssignments = storedData ? JSON.parse(storedData) : [];
      setAssignments(loadedAssignments.sort((a: Assignment, b: Assignment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      console.error("Error loading assignments:", e);
      toast({ title: "Error", description: "Could not load saved assignments.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchGrades();
    loadAssignments();
  }, [fetchGrades, loadAssignments]);

  const handleSaveAssignments = useCallback(() => {
    setIsSaving(true);
    try {
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
      toast({ title: "Assignments Saved", description: "Your changes have been saved locally." });
    } catch (e) {
      console.error("Error saving assignments:", e);
      toast({ title: "Save Failed", description: "Could not save assignments.", variant: "destructive" });
    }
    setIsSaving(false);
  }, [assignments, toast]);

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
      } as Assignment; // Assert type after spreading
      updatedAssignments = [newAssignment, ...assignments];
      toast({ title: "Assignment Added", description: `"${newAssignment.title}" has been added.` });
    }
    setAssignments(updatedAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    resetForm();
    handleSaveAssignments(); // Auto-save after add/edit
  };

  const handleEdit = (assignment: Assignment) => {
    setIsEditing(assignment.id);
    // Ensure dueDate is a Date object for the Calendar component
    const dueDate = assignment.dueDate ? parseISO(assignment.dueDate) : undefined;
    setCurrentAssignment({ ...assignment, dueDate: isValid(dueDate) ? dueDate : undefined });
  };

  const handleDelete = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    toast({ title: "Assignment Deleted", description: "The assignment has been removed. Save changes to make it permanent." });
    handleSaveAssignments(); // Auto-save after delete
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Edit className="h-7 w-7 text-primary"/>Manage Assignments</CardTitle>
          <CardDescription>Create, edit, and manage homework assignments for students. Specify submission types and deadlines.</CardDescription>
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
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
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
                    <Checkbox id="enable-online-submission" checked={currentAssignment.onlineSubmissionEnabled} onCheckedChange={(checked) => handleFormChange('onlineSubmissionEnabled', !!checked)} />
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
            <CardDescription>List of all created assignments. Oldest assignments are at the bottom.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[700px] overflow-y-auto">
            {assignments.length === 0 && <p className="text-muted-foreground text-center py-4">No assignments created yet.</p>}
            {assignments.map(assignment => (
              <Card key={assignment.id} className="bg-card border">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(assignment)}><Edit className="h-4 w-4"/></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Delete Assignment?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{assignment.title}"? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(assignment.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
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
              </Card>
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveAssignments} disabled={isSaving} className="w-full mt-2">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Save All Assignment Data
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
