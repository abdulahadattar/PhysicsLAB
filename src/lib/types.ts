
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
  punjabBoardPdfName?: string; // This was chapter-level, now grade-level
  nationalSyllabusPdfName?: string; // This was chapter-level, now grade-level
  ziauddinBoardPdfName?: string; // This was chapter-level, now grade-level
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
  completeTextbookPdfLink?: string; // STBB Full book
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
  gradeId: string; // Added
  year: number;    // Added
}
