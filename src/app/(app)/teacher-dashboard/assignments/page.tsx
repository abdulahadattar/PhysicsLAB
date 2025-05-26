"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Save, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type Assignment = {
  id: string;
  title: string;
  description: string;
  targetGradeIds: string[];
  dueDate: string;
  submissionType: string;
  onlineSubmissionEnabled: boolean;
  createdAt: string;
};

export default function ManageAssignmentsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({
    title: "",
    description: "",
    targetGradeIds: [],
    dueDate: "",
    submissionType: "text",
    onlineSubmissionEnabled: false,
  });
  const [isEditingId, setIsEditingId] = useState<string | null>(null);

  // Dummy grades for UI
  const studyGrades = [
    { id: 'g9', name: 'Grade 9' },
    { id: 'g10', name: 'Grade 10' }
  ];
  const isLoadingGrades = false;

  const handleFormChange = (field: keyof Assignment, value: any) => {
    setCurrentAssignment(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = useCallback(() => {
    setCurrentAssignment({
      title: "",
      description: "",
      targetGradeIds: [],
      dueDate: "",
      submissionType: "text",
      onlineSubmissionEnabled: false,
    });
    setIsEditingId(null);
  }, []);

  const handleSubmitAssignment = () => {
    if (!currentAssignment.title || !currentAssignment.description) {
      toast({ title: "Missing Fields", description: "Title and description are required." });
      return;
    }
    let updatedAssignmentsList;
    const assignmentPayload = {
      id: isEditingId || `asg-${Date.now()}`,
      createdAt: isEditingId ? (assignments.find(a => a.id === isEditingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      ...currentAssignment,
      dueDate: currentAssignment.dueDate || new Date().toISOString(),
      submissionType: currentAssignment.submissionType || 'text',
      targetGradeIds: currentAssignment.targetGradeIds || [],
      onlineSubmissionEnabled: currentAssignment.onlineSubmissionEnabled || false,
      title: currentAssignment.title || '',
      description: currentAssignment.description || '',
    } as Assignment;
    if (isEditingId) {
      updatedAssignmentsList = assignments.map(a =>
        a.id === isEditingId ? { ...a, ...assignmentPayload } : a
      );
      toast({ title: "Assignment Updated", description: `"${assignmentPayload.title}" has been updated.` });
    } else {
      updatedAssignmentsList = [assignmentPayload, ...assignments];
      toast({ title: "Assignment Added", description: `"${assignmentPayload.title}" has been added.` });
    }
    setAssignments(updatedAssignmentsList);
    resetForm();
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setIsEditingId(assignment.id);
    setCurrentAssignment({ ...assignment });
  };

  const handleDeleteAssignment = (id: string) => {
    const newAssignments = assignments.filter(a => a.id !== id);
    setAssignments(newAssignments);
    toast({ title: "Assignment Deleted", description: "The assignment has been removed." });
    if (isEditingId === id) resetForm();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl"><Edit className="h-7 w-7 text-primary"/>Manage Assignments</CardTitle>
          <CardDescription>Create, edit, and manage assignments. Changes are saved locally to your browser.</CardDescription>
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
                                <input
                                    type="checkbox"
                                    id={`grade-${grade.id}`}
                                    checked={(currentAssignment.targetGradeIds || []).includes(grade.id)}
                                    onChange={e => {
                                      const checked = e.target.checked;
                                      handleFormChange('targetGradeIds', checked
                                        ? [...(currentAssignment.targetGradeIds || []), grade.id]
                                        : (currentAssignment.targetGradeIds || []).filter((id: string) => id !== grade.id)
                                      );
                                    }}
                                />
                                <Label htmlFor={`grade-${grade.id}`} className="font-normal text-sm cursor-pointer">{grade.name}</Label>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-xs text-muted-foreground mt-1">No grades loaded for selection.</p>}
            </div>
            <div>
              <Label htmlFor="assignment-due-date">Due Date <span className="text-destructive">*</span></Label>
              <Input id="assignment-due-date" type="date" value={currentAssignment.dueDate ? currentAssignment.dueDate.substring(0,10) : ""} onChange={e => handleFormChange('dueDate', e.target.value)} />
            </div>
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
            <CardDescription>List of all created assignments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {assignments.length === 0 && <p className="text-muted-foreground text-center py-6">No assignments created yet. Add one using the form on the left.</p>}
            {assignments.map(assignment => {
              return (
                <Card key={assignment.id} className="bg-card border transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2 cursor-pointer group" onClick={() => handleEditAssignment(assignment)}>
                      <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-lg group-hover:text-primary">{assignment.title}</CardTitle>
                          <div className="flex gap-1 items-center flex-shrink-0">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); handleEditAssignment(assignment);}} aria-label="Edit Assignment"><Edit className="h-4 w-4"/></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={e => { e.stopPropagation(); handleDeleteAssignment(assignment.id);}} aria-label="Delete Assignment"><Trash2 className="h-4 w-4"/></Button>
                          </div>
                      </div>
                  </CardHeader>
                  <CardContent className="pb-3 pt-1">
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{assignment.description}</p>
                    <div className="mt-1 text-xs">
                      <span className="font-semibold">Submission:</span>
                      <span className="capitalize ml-1">{assignment.submissionType?.replace('_', ' / ')}. </span>
                      {assignment.onlineSubmissionEnabled ?
                        <span className="text-green-600 dark:text-green-400">(Online Portal Enabled)</span> :
                        <span className="text-red-600 dark:text-red-400">(Online Portal Disabled)</span>
                      }
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

