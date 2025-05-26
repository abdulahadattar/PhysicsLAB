// This file contains temporary mock assignment data for demonstration and testing purposes only.
// In future releases, all assignments and submissions will be dynamically populated from real student activity and backend integration.
// Do not use this file for production data or permanent storage.

import type { Assignment } from '@/lib/types'; // Adjust path as needed

// Temporary internal state for mocks to be updatable by the page
const MOCK_ASSIGNMENTS_INTERNAL: Assignment[] = [
  {
    id: 'physics-101-lab-report',
    title: 'Lab Report: Newton\'s Laws',
    description: 'Complete the experiment on Newton\'s Second Law and submit your findings. Ensure your report includes a hypothesis, methodology, results, and conclusion. Submit as a file link (e.g., Google Doc, PDF in Drive).',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    submissionType: 'file', // 'file' will now imply link submission on student side
    pointsPossible: 100,
    associatedSimulations: ['phet-forces-motion-basics-g9'],
    targetGradeIds: [],
    onlineSubmissionEnabled: true,
    createdAt: new Date().toISOString(),
    studentSpecificSubmission: {
      studentId: 'student123', // This would be dynamically set based on logged-in user
      status: 'Not Submitted',
      submittedAt: '',
    },
    allStudentSubmissions: [ // Example submissions for teacher view
        {
            studentId: 'studentAlpha',
            studentName: 'Alpha Student',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            fileLink: 'https://docs.google.com/document/d/example_alpha/edit?usp=sharing',
            fileName: 'Alpha_Newton_Report.pdf',
            status: 'Submitted',
        },
        {
            studentId: 'studentBeta',
            studentName: 'Beta Student',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            textSubmission: 'My report is available at the following link.',
            fileLink: 'https://onedrive.live.com/redir?resid=EXAMPLEBETA&authkey=!EXAMPLEKEY',
            fileName: 'Beta_Lab_Newton.docx',
            status: 'Graded',
            grade: '90/100',
            feedback: 'Excellent analysis of data. Ensure all graphs are labeled next time.'
        }
    ]
  },
  {
    id: 'kinematics-problems',
    title: 'Kinematics Problems',
    description: 'Solve the attached problems related to kinematics. Show all your work. Submit as a text entry, or provide a link to a document with your solutions.',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    submissionType: 'text_and_file', // Allow both text and/or a file link
    pointsPossible: 50,
    associatedQuizzes: ['kinematics-g9'],
    targetGradeIds: [],
    onlineSubmissionEnabled: true,
    createdAt: new Date().toISOString(),
    // studentSpecificSubmission will be populated dynamically in getAssignmentById for 'student123'
  }
];

// Helper function to get a single assignment
// In a real app, currentStudentId would come from the authenticated user session
export const getAssignmentById = async (id: string, currentStudentId?: string): Promise<Assignment | undefined> => {
  console.log(`Mock Fetch: getAssignmentById, id: ${id}, studentId: ${currentStudentId}`);
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate async
  
  const assignment = MOCK_ASSIGNMENTS_INTERNAL.find(assign => assign.id === id);

  if (assignment && currentStudentId) {
    // Try to find an existing submission for this student within allStudentSubmissions
    const studentSubmissionFromFile = assignment.allStudentSubmissions?.find(sub => sub.studentId === currentStudentId);
    
    if (studentSubmissionFromFile) {
      return { ...assignment, studentSpecificSubmission: studentSubmissionFromFile };
    } else if (assignment.id === 'kinematics-problems' && currentStudentId === 'student123-mock-uid') { 
      // Specific mock for student123 for kinematics-problems if not found in allStudentSubmissions
      // This is a bit convoluted due to client-side mocks, a backend would handle this cleanly.
      return {
        ...assignment,
        studentSpecificSubmission: {
          studentId: currentStudentId,
          status: 'Graded',
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          textSubmission: 'Solutions for Kinematics: 1. Answer A, 2. Answer B...',
          fileLink: 'https://example.com/mysolutions.pdf',
          fileName: 'kinematics_solutions.pdf',
          grade: '45/50',
          feedback: 'Good effort! Pay closer attention to unit conversions on question 3.'
        }
      };
    } else {
      // If no specific submission found for this student, ensure studentSpecificSubmission is at least minimally initialized
      return {
        ...assignment,
        studentSpecificSubmission: {
            studentId: currentStudentId,
            status: 'Not Submitted',
            submittedAt: '',
            ...(assignment.studentSpecificSubmission || {}) // Keep any default if present but override status
        }
      };
    }
  }
  return assignment; // Return as is if no currentStudentId or no specific logic matches
};

// Function to simulate updating assignment data (TEMPORARY HACK)
// In a real app, this would be a backend API call.
export const updateAssignmentData = async (assignmentId: string, studentId: string) => {
  console.log(`Mock Update: updateAssignmentData, assignmentId: ${assignmentId}, studentId: ${studentId}`);
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate async

  // Find the assignment in the mock data
  const assignmentIndex = MOCK_ASSIGNMENTS_INTERNAL.findIndex(assign => assign.id === assignmentId);

  if (assignmentIndex !== -1) {
    const assignment = MOCK_ASSIGNMENTS_INTERNAL[assignmentIndex];

    // Find the student's submission in allStudentSubmissions
    let studentSubmission = assignment.allStudentSubmissions?.find(sub => sub.studentId === studentId);

    if (studentSubmission) {
      // Update the existing submission (e.g., change status, add feedback)
      studentSubmission.status = 'Submitted';
      studentSubmission.submittedAt = new Date().toISOString();
    } else {
      // Create a new submission
      studentSubmission = {
        studentId: studentId,
        studentName: 'New Student', // Replace with actual student name
        submittedAt: new Date().toISOString(),
        status: 'Submitted',
      };
      assignment.allStudentSubmissions = assignment.allStudentSubmissions || [];
      assignment.allStudentSubmissions.push(studentSubmission);
    }

    // Update the studentSpecificSubmission as well
    assignment.studentSpecificSubmission = studentSubmission;

    // Optionally, update lastPracticeDate in localStorage
    try {
      localStorage.setItem('lastPracticeDate', new Date().toISOString());
    } catch (e) {
      console.error('Error writing lastPracticeDate to localStorage:', e);
    }

    // Replace the assignment in the array
    MOCK_ASSIGNMENTS_INTERNAL[assignmentIndex] = assignment;
  }
};

// Function to get the last practice date from localStorage
export const getLastPracticeDate = (): string | null => {
  try {
    return localStorage.getItem('lastPracticeDate');
  } catch (e) {
    console.error('Error reading lastPracticeDate from localStorage:', e);
    return null;
  }
};

// Expose the internal mock array for modification by the page (TEMPORARY HACK for client-side demo)
// In a real app, this interaction would be with a backend API.
(getAssignmentById as any).MOCK_ASSIGNMENTS_INTERNAL_TEMP = MOCK_ASSIGNMENTS_INTERNAL;
