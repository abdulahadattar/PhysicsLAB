export interface ChapterContent {
  stbbChapterPdfLink?: string;
  teacherNotesPdfName?: string; // Note: Storing filename implies a convention for base URL or local storage access
  alternativeChapterPdfLink?: string;
  punjabBoardPdfName?: string;
  nationalSyllabusPdfName?: string;
  ziauddinBoardPdfName?: string;
  keyPoints?: string;
  summary?: string; // Short summary of the chapter
  formulas?: { formula: string; description: string }[]; // Array of LaTeX formulas and descriptions
  mcqs?: MCQ[];
  shortAnswers?: QuestionAnswer[];
  longAnswers?: QuestionAnswer[];
  realWorldExamples?: string[]; // Real-world examples/applications
  diagramDescriptions?: { title: string; description: string }[]; // Array of diagram/figure descriptions
  philosophicalQuestions?: { question: string; hint?: string }[];
  dailyLifeExamples?: string[];
  suggestedSimulations?: string[];
  youtubeExperimentLinks?: {title: string, url: string}[];
  realWorldApplications?: string[];
  workedExamples?: {problem: string, steps: string[]}[];
  lastUpdated?: string;
  pdfResources?: PdfResource[]; // Added pdfResources field
}

export interface PdfResource {
  label: string;
  icon: string;
  url: string;
}

export interface Chapter {
  id: string;
  name: string;
  tags?: string[];
  content?: ChapterContent;
}

export interface StudyGrade {
  id: string;
  name: string;
  chapters: Chapter[];
  completeTextbookPdfLink?: string;
  ziauddinBoardFullPdfLink?: string;
  punjabBoardFullPdfLink?: string;
  nationalSyllabusFullPdfLink?: string;
}

export interface TeacherChapterOverride extends ChapterContent {
  chapterId: string;
  gradeId: string;
}

export type TeacherChapterOverrides = Record<string, TeacherChapterOverride>;

export interface TeacherGradeOverride {
  gradeId: string;
  completeTextbookPdfLink?: string;
  ziauddinBoardFullPdfLink?: string;
  punjabBoardFullPdfLink?: string;
  nationalSyllabusFullPdfLink?: string;
  lastUpdated?: string;
}

export type TeacherGradeOverrides = Record<string, TeacherGradeOverride>;

export interface ModelPaper {
  id: string;
  title: string;
  description?: string;
  url: string;
  gradeId: string;
  year: number;
}

// Updated Assignment related types
export type SubmissionStatus = 'Not Submitted' | 'Submitted' | 'Late' | 'Graded' | 'Rejected'; // Added 'Rejected'

export interface StudentSubmission {
  studentId: string;
  studentName?: string; // Optional, but good for teacher view
  submittedAt: string; // ISO date string
  textSubmission?: string;
  fileLink?: string; // URL to the cloud-stored file
  fileName?: string; // Original name of the file student "uploaded" (via link)
  grade?: string; // e.g., "A", "85/100"
  feedback?: string; // Teacher's feedback
  status: SubmissionStatus;
  rejectionReason?: string; // For 'Rejected' status
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  submissionType: 'text' | 'file' | 'text_and_file' | 'none'; // 'file' now implies link submission
  pointsPossible?: number;
  associatedSimulations?: string[];
  associatedQuizzes?: string[];
  targetGradeIds: string[]; // Added from teacher assignment management
  onlineSubmissionEnabled: boolean; // Added from teacher assignment management
  createdAt: string; // Added from teacher assignment management

  // For student view (populated dynamically or from a larger list)
  studentSpecificSubmission?: StudentSubmission;

  // For teacher view (list of all submissions for this assignment)
  allStudentSubmissions?: StudentSubmission[];
}


export type QuestionType = 'single-choice' | 'multiple-choice' | 'short-answer' | 'long-answer' | 'true-false';

export interface Question {
  questionId: string; // Unique ID for the question
  quizId: string; // Link to the parent quiz
  questionText: string;
  questionType: QuestionType;
  options?: string[]; // For 'single-choice', 'multiple-choice', 'true-false'
  correctAnswer?: string | string[]; // String for single/short/true-false, string[] for multiple
  points: number;
  explanation?: string; // Optional explanation for the correct answer
}

export interface Quiz {
  quizId: string; // Unique ID for the quiz
  title: string;
  description?: string;
  chapterId?: string; // Optional link to a specific chapter
  gradeId?: string; // Optional link to a specific grade
  timeLimit?: number; // Time limit in minutes (optional)
  questionIds: string[]; // Array of question IDs belonging to this quiz
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}

export interface AnswerGiven {
  questionId: string;
  answer: string | string[]; // Student's answer(s)
  isCorrect: boolean; // Whether the student's answer was correct
  pointsEarned: number; // Points earned for this question
  maxPoints: number; // Maximum possible points for this question
}


export interface SimulationTopic {
  id: string;
  name: string;
  grade: string;
  description: string;
  icon: React.ElementType;
  categories?: string[];
  image?: string;
  aiHint?: string;
}

export interface QuizAttempt {
  attemptId: string; // Unique ID for the attempt
  userId: string; // ID of the user who took the quiz
  quizId: string; // ID of the quiz attempted
  quizTitle: string; // Title of the quiz at the time of attempt
  score: number; // Score achieved in the attempt
  maxScore: number; // Maximum possible score for the quiz
  answersGiven: AnswerGiven[]; // Array of answers and results for each question
  startedAt: string; // ISO date string when the attempt started
  completedAt: string; // ISO date string when the attempt was completed
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  matchExact?: boolean;
  subItems?: NavItem[];
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string | string[]; // For multiple choice, can be string[]
  explanation?: string; // Optional explanation
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface PhilosophicalQuestionItem {
  question: string;
  hint?: string; // Optional hint
}

export interface PhilosophicalBranch {} // Placeholder
export interface ResearchCenter {} // Placeholder
export interface UniversityProgram {} // Placeholder
export interface LabEquipmentItem {} // Placeholder
