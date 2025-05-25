


export interface TimelineEventDetail {
  type: 'scientist' | 'discovery' | 'era'; // Type of detail
  title: string;
  description: string;
  image?: string; // URL to an image
  date?: string; // Specific date if applicable
  relatedFormula?: string; // e.g., "E=mc²"
  experimentDetails?: string; // Description of an experiment
  biography?: string; // For scientists
  links?: { label: string; url: string }[]; // Further reading
}

export interface TimelineEventNode {
  id: string; // Unique ID for the event
  year: number; // The year the event primarily occurred or is placed
  eraAdjust?: number; // Optional, for visual grouping, how many years this event conceptually spans or should be grouped with
  title: string; // Short title for the timeline node
  shortDescription: string; // Very brief description for the node itself or a tooltip
  category: 'Early Discoveries' | 'Classical Mechanics' | 'Thermodynamics' | 'Electromagnetism' | 'Relativity' | 'Quantum Mechanics' | 'Modern Physics' | 'Cosmology';
  icon?: string; // Lucide icon name string, or path to a custom small icon
  image?: string; // URL to a representative image for the node (scientist photo, discovery diagram)
  cartoonImage?: string; // URL to a cartoonish representation if real image is unavailable
  details: TimelineEventDetail[]; // Array of detailed information items to show when clicked
}

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

export interface PhilosophicalQuestionItem {
  id: string;
  question: string;
  hint?: string;
}

export interface PhysicsTimelineData {
  title: string;
  description: string;
  events: TimelineEventNode[];
}

export interface PhilosophicalBranch {
  id: string;
  branchName: string;
  questions: PhilosophicalQuestionItem[];
}


export interface ResearchCenter {
  id: string;
  name: string;
  location: string;
  primaryFocus: string;
  keyAchievement: string;
  websiteUrl: string;
}

export interface UniversityProgram {
  id: string;
  name: string;
  city: string;
  type: 'Public' | 'Private';
  degreesOffered: string[];
  keyLabs: string[];
  departmentUrl: string;
}

export interface LabEquipmentItem {
  id: string;
  name: string;
  purpose: string;
  principle: string;
  typicalExperiments: string[];
  imagePath?: string;
  imagePlaceholderText?: string; // Added for cases where imagePath is not available
}


export interface ChapterContent {
  stbbChapterPdfLink?: string;
  teacherNotesPdfName?: string; // Note: Storing filename implies a convention for base URL or local storage access
  alternativeChapterPdfLink?: string;
  punjabBoardPdfName?: string;
  nationalSyllabusPdfName?: string;
  ziauddinBoardPdfName?: string;
  keyPoints?: string;
  mcqs?: MCQ[];
  shortAnswers?: QuestionAnswer[];
  longAnswers?: QuestionAnswer[];
  philosophicalQuestions?: { question: string; hint?: string }[];
  dailyLifeExamples?: string[];
  suggestedSimulations?: string[]; 
  youtubeExperimentLinks?: {title: string, url: string}[];
  realWorldApplications?: string[];
  workedExamples?: {problem: string, steps: string[]}[];
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

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  matchExact?: boolean;
  subItems?: NavItem[];
}
