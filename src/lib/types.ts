// /home/user/PhysicsLAB/src/lib/types.ts
import { z } from 'zod';

// --- MCQ Definition ---
export interface MCQ {
 id: string; // e.g., "g9u1mcq1"
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}
export const McqSchema = z.object({
  id: z.string().min(1, "MCQ ID cannot be empty"),
  question: z.string().min(1, "MCQ question text cannot be empty"),
  options: z.array(z.string().min(1)).min(2, "MCQ must have at least 2 options"),
  correctAnswerIndex: z.number().int().nonnegative(),
  explanation: z.string().optional(),
});
export type McqType = z.infer<typeof McqSchema>; // For type inference from Zod schema

// --- QuestionAnswer Definition (for CRQs, ERQs, Numericals) ---
export interface QuestionAnswer {
  id: string; // e.g., "g9u1crq1"
  question: string;
  answer_guideline?: string; // Using this as "solution" or "answer"
}
export const QuestionAnswerSchema = z.object({
  id: z.string().min(1, "Question ID cannot be empty"),
  question: z.string().min(1, "Question text cannot be empty"),
  answer_guideline: z.string().optional(),
});
export type QuestionAnswerType = z.infer<typeof QuestionAnswerSchema>;

// --- PdfResource Definition ---
export interface PdfResource {
  id: string; // e.g., "g9u1pdf1_stbb"
  label: string;
  url: string; // Local path (e.g., /textbooks/grade9/unit1.pdf) or external URL
  icon?: string; // Lucide icon name
  downloadable?: boolean;
}
export const PdfResourceSchema = z.object({
  id: z.string().min(1, "PDF Resource ID cannot be empty"),
  label: z.string().min(1, "PDF Resource label cannot be empty"),
  url: z.string().min(1, "PDF URL/path cannot be empty"), // Can add .url() if always external
  icon: z.string().optional(),
  downloadable: z.boolean().optional().default(true),
});
export type PdfResourceType = z.infer<typeof PdfResourceSchema>;

// --- UnitData Definition (Master structure for each unit's .ts data file) ---
export interface UnitData {
  unitId: string; // e.g., "g9-u1"
  unitName: string; // e.g., "Unit 1: Physical Quantities and Measurement"
  gradeId: string; // e.g., "grade9"
  gradeName: string; // e.g., "Grade IX"
  sectionName: string; // e.g., "Section 1: General Physics"

  summary?: string;
  keyPoints?: string[];

  mcqs?: MCQ[];
  conceptualQuestions?: QuestionAnswer[]; // CRQs
  extendedResponseQuestions?: QuestionAnswer[]; // ERQs
  numericalProblems?: QuestionAnswer[]; // Numericals from textbook exercises

  pdfResources?: PdfResource[];
  lastUpdated?: string; // ISO date string
}
export const UnitDataSchema = z.object({
  unitId: z.string().min(1),
  unitName: z.string().min(1),
  gradeId: z.string().min(1),
  gradeName: z.string().min(1),
  sectionName: z.string().min(1),
  summary: z.string().optional(),
  keyPoints: z.array(z.string()).optional(),
  mcqs: z.array(McqSchema).optional(),
  conceptualQuestions: z.array(QuestionAnswerSchema).optional(),
  extendedResponseQuestions: z.array(QuestionAnswerSchema).optional(),
  numericalProblems: z.array(QuestionAnswerSchema).optional(),
  pdfResources: z.array(PdfResourceSchema).optional(),
  lastUpdated: z.string().datetime({ offset: true }).optional(), // ISO date string
});
export type UnitDataType = z.infer<typeof UnitDataSchema>;


export interface ChapterContent {
  stbbChapterPdfLink?: string;
  teacherNotesPdfName?: string;
  alternativeChapterPdfLink?: string;
  punjabBoardPdfName?: string;
  nationalSyllabusPdfName?: string;
  ziauddinBoardPdfName?: string;
  keyPoints?: string;
  summary?: string;
  formulas?: { formula: string; description: string }[];
  mcqs?: MCQ[]; // Uses updated MCQ type
  shortAnswers?: QuestionAnswer[]; // Uses updated QuestionAnswer type
  longAnswers?: QuestionAnswer[]; // Uses updated QuestionAnswer type
  realWorldExamples?: string[];
  diagramDescriptions?: { title: string; description: string }[];
  philosophicalQuestions?: { question: string; hint?: string }[];
  dailyLifeExamples?: string[];
  suggestedSimulations?: string[];
  youtubeExperimentLinks?: {title: string, url: string}[];
  realWorldApplications?: string[];
  workedExamples?: {problem: string, steps: string[]}[];
  lastUpdated?: string;
  pdfResources?: PdfResource[]; // Uses the PdfResource type defined below
}

  mcqs?: MCQ[]; // Uses the updated MCQ type
  conceptualQuestions?: QuestionAnswer[]; // CRQs - Uses the updated QuestionAnswer type
  extendedResponseQuestions?: QuestionAnswer[]; // ERQs - Uses the updated QuestionAnswer type
  numericalProblems?: QuestionAnswer[]; // Numericals from textbook exercises - Uses the updated QuestionAnswer type

  pdfResources?: PdfResource[]; // Uses the updated PdfResource type
  lastUpdated?: string; // ISO date string
}
export interface Chapter { // This interface describes items in the `chapters` array of StudyGrade in the manifest
  id: string; // e.g., "g9-u1". This will be used as the unitId in the dynamic route.
  name: string; // e.g., "Unit 1: Physical Quantities and Measurement"
  tags?: string[];
  dataPath: string; // Path to the detailed unit data file (e.g., "grade9/g9-u1-data.ts") - Added this
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

export type SubmissionStatus = 'Not Submitted' | 'Submitted' | 'Late' | 'Graded' | 'Rejected';

export interface StudentSubmission {
  studentId: string;
  studentName?: string;
  submittedAt: string;
  textSubmission?: string;
  fileLink?: string;
  fileName?: string;
  grade?: string;
  feedback?: string;
  status: SubmissionStatus;
  rejectionReason?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  submissionType: 'text' | 'file' | 'text_and_file' | 'none';
  pointsPossible?: number;
  associatedSimulations?: string[];
  associatedQuizzes?: string[];
  targetGradeIds: string[];
  onlineSubmissionEnabled: boolean;
  createdAt: string;
  studentSpecificSubmission?: StudentSubmission;
  allStudentSubmissions?: StudentSubmission[];
}

export type QuestionType = 'single-choice' | 'multiple-choice' | 'short-answer' | 'long-answer' | 'true-false';

export interface Question {
  questionId: string;
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
}

export interface Quiz {
  quizId: string;
  title: string;
  description?: string;
  chapterId?: string;
  gradeId?: string;
  timeLimit?: number;
  questionIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface AnswerGiven {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
}

export interface SimulationTopic {
  id: string;
  name: string;
  grade: string;
  description: string;
  icon: React.ElementType; // Lucide icon component
  categories?: string[];
  image?: string;
  aiHint?: string;
}

export interface QuizAttempt {
  attemptId: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  answersGiven: AnswerGiven[];
  startedAt: string;
  completedAt: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType; // Lucide icon component
  matchExact?: boolean;
  subItems?: NavItem[];
}

export const PdfResourceSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string().url(),
  icon: z.string().optional(),
  downloadable: z.boolean().optional(),
}

export interface PhilosophicalQuestionItem {
  question: string;
  hint?: string;
}

// Keep placeholders or expand them if needed for other features
export interface PhilosophicalBranch {}
export interface ResearchCenter {}
export interface UniversityProgram {}
export interface LabEquipmentItem {}