
export interface Chapter {
  id: string;
  name: string;
  // Add other chapter-specific fields here if needed, e.g., pdfUrl, mcqs, keyPoints
}

export interface StudyGrade {
  id: string;
  name: string;
  chapters: Chapter[];
}

// You can add other shared types here
