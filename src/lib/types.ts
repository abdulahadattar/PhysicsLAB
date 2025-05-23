
export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
}

export interface ChapterContent {
  stbbChapterPdfLink?: string;
  teacherNotesPdfName?: string;
  alternativeChapterPdfLink?: string;
  punjabBoardPdfName?: string;
  nationalSyllabusPdfName?: string;
  ziauddinBoardPdfName?: string;
  keyPoints?: string;
  mcqs?: MCQ[];
  shortAnswers?: QuestionAnswer[]; // CRQs
  longAnswers?: QuestionAnswer[];  // ERQs
  lastUpdated?: string;
}

export interface Chapter {
  id: string;
  name: string;
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

export interface Assignment {
  id: string;
  title: string;
  description: string;
  targetGradeIds: string[];
  dueDate: string; // ISO string for date
  submissionType: 'online' | 'physical' | 'both';
  onlineSubmissionEnabled: boolean;
  createdAt: string; // ISO string for date
}

export interface Submission {
  id: string; // Unique ID for the submission
  assignmentId: string;
  studentId: string; // Mock student ID
  studentName: string; // Mock student name
  submittedAt: string; // ISO date string
  submittedContentLink?: string; // Mock link: "submission_studentName_assignmentTitle.pdf"
  marks?: string; // Allow text like "A+", "Good", or number as string
  remarks?: string;
  status: 'pending_review' | 'graded' | 'rejected';
  rejectionReason?: string;
}
