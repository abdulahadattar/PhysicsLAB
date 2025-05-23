
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
  stbbChapterPdfLink?: string; // Renamed for clarity (Sindh Textbook Board Chapter PDF)
  teacherNotesPdfName?: string;
  alternativeChapterPdfLink?: string; // Renamed for clarity
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
  completeTextbookPdfLink?: string; // This will represent the STBB full book
  ziauddinBoardFullPdfLink?: string;
  punjabBoardFullPdfLink?: string;
  nationalSyllabusFullPdfLink?: string; // For "Pakistan National Syllabus"
}

export interface TeacherChapterOverride extends ChapterContent {
  chapterId: string;
  gradeId: string;
}

// This type will store all chapter overrides, keyed by chapterId
export type TeacherChapterOverrides = Record<string, TeacherChapterOverride>;

// New Type for Grade-Level Teacher Overrides (for full textbook links)
export interface TeacherGradeOverride {
  gradeId: string;
  completeTextbookPdfLink?: string;
  ziauddinBoardFullPdfLink?: string;
  punjabBoardFullPdfLink?: string;
  nationalSyllabusFullPdfLink?: string;
  lastUpdated?: string;
}

export type TeacherGradeOverrides = Record<string, TeacherGradeOverride>;
