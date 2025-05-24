"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AssignmentForm } from '@/components/assignments/AssignmentForm';
import type { AssignmentFormData, Assignment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

// Mock user session (replace with your actual UserSessionContext and role check)
// import { useUserSession } from '@/hooks/useUserSession';
const MockUserSession = () => {
  // Simulate teacher role and a mock user ID
  return { role: 'teacher', userId: 'mock-teacher-123' };
};

// Mock Assignment Data (replace with actual data fetching)
// This is a placeholder. In a real app, you'd fetch from your backend.
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assignment-1',
    title: 'Kinematics Problems',
    description: 'Solve problems related to motion with constant acceleration.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    submissionType: 'text',
    pointsPossible: 50,
    associatedSimulations: ['motion-constant-acceleration-g9'],
    associatedQuizzes: [],
    studentSpecificSubmission: {},
    allStudentSubmissions: {}
  },
  {
    id: 'assignment-2',
    title: 'Lab Report: Density',
    description: 'Write a lab report based on the density and buoyancy simulation.',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    submissionType: 'file',
    pointsPossible: 100,
    associatedSimulations: ['density-buoyancy-lab-g9'],
    associatedQuizzes: [],
    studentSpecificSubmission: {},
    allStudentSubmissions: {}
  }
];

// Mock function to fetch assignment by ID (replace with actual API call)
const fetchAssignmentByIdAPI = async (id: string): Promise<Assignment | undefined> => {
  console.log(`Fetching assignment (simulated API call) with ID: ${id}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return MOCK_ASSIGNMENTS.find(assignment => assignment.id === id);
};

// Mock function to update assignment (replace with actual API call)
const updateAssignmentAPI = async (id: string, assignmentData: Partial<Omit<Assignment, 'id' | 'studentSpecificSubmission' | 'allStudentSubmissions'>>): Promise<Assignment> => {
  console.log(`Updating assignment (simulated API call) with ID: ${id}`, assignmentData);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  // In a real app, the API would update the assignment in the database
  const existingAssignmentIndex = MOCK_ASSIGNMENTS.findIndex(assignment => assignment.id === id);

  if (existingAssignmentIndex === -1) {
      throw new Error("Assignment not found for update.");
  }

  const updatedAssignment = {
      ...MOCK_ASSIGNMENTS[existingAssignmentIndex],
      ...assignmentData,
      id: id, // Ensure ID is not changed
  };

  // Update the mock array (in a real app, this happens on the backend)
  MOCK_ASSIGNMENTS[existingAssignmentIndex] = updatedAssignment;

  return updatedAssignment;
};


export default function EditAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const { toast } = useToast();
  const { role } = MockUserSession(); // Use your actual session hook

  const [assignmentData, setAssignmentData] = useState<AssignmentFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Protect this page for teachers only
  if (role !== 'teacher') {
    // In a real app, you might redirect or show an unauthorized message
    // router.push('/'); // Redirect to home or a "not authorized" page
    return <div className="p-4">You are not authorized to view this page.</div>;
  }

  useEffect(() => {
    const loadAssignment = async () => {
      if (!assignmentId) {
        setError("Assignment ID is missing.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAssignmentByIdAPI(assignmentId);
        if (data) {
          // Convert data from API format to form data format
          const formData: AssignmentFormData = {
            title: data.title,
            description: data.description,
            dueDate: new Date(data.dueDate), // Convert ISO string back to Date object
            submissionType: data.submissionType,
            pointsPossible: data.pointsPossible ?? undefined, // Ensure undefined if null/undefined
            associatedSimulations: data.associatedSimulations || [],
            associatedQuizzes: data.associatedQuizzes || [],
          };
          setAssignmentData(formData);
        } else {
          setError(`Assignment with ID "${assignmentId}" not found.`);
        }
      } catch (err) {
        console.error("Failed to fetch assignment:", err);
        setError("Failed to load assignment data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignment();
  }, [assignmentId]); // Re-run effect if assignmentId changes

  const handleUpdateAssignment = async (formData: AssignmentFormData) => {
    if (!assignmentId) {
       toast({
            title: "Error",
            description: "Cannot update assignment: ID is missing.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for your API (e.g., convert dueDate to ISO string)
      const assignmentPayload = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate.toISOString(),
        submissionType: formData.submissionType,
        pointsPossible: formData.pointsPossible === null ? undefined : formData.pointsPossible, // Ensure undefined if null
        associatedSimulations: formData.associatedSimulations,
        associatedQuizzes: formData.associatedQuizzes,
      };

      const updatedAssignment = await updateAssignmentAPI(assignmentId, assignmentPayload);

      toast({
        title: "Success!",
        description: `Assignment "${updatedAssignment.title}" updated successfully.`,
      });
      // Redirect back to the assignments list or the updated assignment's page
      router.push('/teacher-dashboard/assignments'); // Or `/assignments/${updatedAssignment.id}`
    } catch (error) {
      console.error("Failed to update assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Assignment</CardTitle>
          <CardDescription>Update the details for this assignment.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3">Loading assignment...</p>
            </div>
          )}
          {error && !isLoading && (
             <div className="text-center text-destructive p-4">{error}</div>
          )}
          {!isLoading && !error && assignmentData && (
            <AssignmentForm
              initialData={assignmentData}
              onSubmit={handleUpdateAssignment}
              isSubmitting={isSubmitting}
              submitButtonText="Update Assignment"
            />
          )}
           {!isLoading && !error && !assignmentData && (
               <div className="text-center text-muted-foreground p-4">Assignment data could not be loaded.</div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}