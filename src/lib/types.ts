
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
  sindhTextbookPdfName?: string;
  alternativeTextbookPdfName?: string;
  teacherNotesPdfName?: string;
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
}

export interface TeacherChapterOverride extends ChapterContent {
  chapterId: string;
  gradeId: string;
}

export type TeacherChapterOverrides = Record<string, TeacherChapterOverride>;

// You can add other shared types here
