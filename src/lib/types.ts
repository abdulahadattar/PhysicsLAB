

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

/**
 * Represents a philosophical question for critical thinking.
 * @property {string} question - The philosophical question itself.
 * @property {string} [hint] - An optional hint to guide student thinking.
 */
export interface PhilosophicalQuestionItem {
  id: string; // Added for unique key in lists
  question: string;
  hint?: string;
}

/**
 * Represents a branch of physics for categorizing philosophical questions.
 * @property {string} branchName - The name of the physics branch (e.g., "Classical Mechanics").
 * @property {PhilosophicalQuestionItem[]} questions - An array of philosophical questions for this branch.
 */
export interface PhilosophicalBranch {
  id: string; // Added for unique key
  branchName: string;
  questions: PhilosophicalQuestionItem[];
}


/**
 * Describes a prominent physics research center.
 * @property {string} name - The name of the research center.
 * @property {string} location - The primary location of the center.
 * @property {string} primaryFocus - A brief description of its main research areas.
 * @property {string} keyAchievement - A notable achievement or discovery.
 * @property {string} websiteUrl - The official website URL.
 */
export interface ResearchCenter {
  id: string; // Added for unique key
  name: string;
  location: string;
  primaryFocus: string;
  keyAchievement: string;
  websiteUrl: string;
}

/**
 * Describes a university offering physics programs.
 * @property {string} name - The name of the university.
 * @property {string} city - The city where the university is primarily located.
 * @property {'Public' | 'Private'} type - The type of university.
 * @property {string[]} degreesOffered - A list of physics-related degrees offered (e.g., "BSc Physics", "MS Applied Physics").
 * @property {string[]} keyLabs - A list of notable physics-related labs or research groups.
 * @property {string} departmentUrl - The URL to the physics department or relevant faculty page.
 */
export interface UniversityProgram {
  id: string; // Added for unique key
  name: string;
  city: string;
  type: 'Public' | 'Private';
  degreesOffered: string[];
  keyLabs: string[];
  departmentUrl: string;
}

/**
 * Describes a piece of common physics laboratory equipment.
 * @property {string} name - The name of the equipment.
 * @property {string} purpose - A brief description of what the equipment is used for.
 * @property {string} principle - A concise explanation of its working principle.
 * @property {string[]} typicalExperiments - Examples of experiments where this equipment is used.
 * @property {string} [imagePlaceholderText] - Text for an image placeholder if no actual image is available.
 */
export interface LabEquipmentItem {
  id: string; // Added for unique key
  name: string;
  purpose: string;
  principle: string;
  typicalExperiments: string[];
  imagePlaceholderText?: string; // To use if actual images aren't available
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
  shortAnswers?: QuestionAnswer[];
  longAnswers?: QuestionAnswer[];
  philosophicalQuestions?: PhilosophicalQuestionItem[];
  dailyLifeExamples?: string[];
  suggestedSimulations?: string[]; // Array of simulation IDs
  lastUpdated?: string;
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
  completeTextbookPdfLink?: string; // Primary STBB full textbook link for the grade
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
  dueDate: string; 
  submissionType: 'online' | 'physical' | 'both';
  onlineSubmissionEnabled: boolean; 
  createdAt: string; 
}

export interface Submission {
  id: string; 
  assignmentId: string;
  studentId: string; 
  studentName: string; 
  submittedAt: string; 
  submittedContentLink?: string; 
  marks?: string; 
  remarks?: string;
  status: 'pending_review' | 'graded' | 'rejected';
  rejectionReason?: string;
}
    
