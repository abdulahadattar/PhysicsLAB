// src/data/grade11/g11-u2-data.ts
import type { UnitDataType } from '@/lib/unitDataTypes';

export const grade11Unit2Data: UnitDataType = { // Variable name changed
  id: "g11-u2",                             // ID changed
  title: "Unit 2: Kinematics",               // Title changed
  // For now, summary, keyPoints, mcqs etc. can be copied from g9-u1-data.ts
  // You will populate these with actual content for Unit 2 later.
  summary: `Placeholder summary for Kinematics...`,
  keyPoints: [`Placeholder key point for Kinematics...`],
  mcqs: [], // Start with empty or one placeholder MCQ
  conceptualQuestions: [],
  extendedResponseQuestions: [],
  numericalProblems: [],
  pdfResources: [
    // You'll need to find or create a PDF for each unit/chapter later
    // { id: "g11u2pdf1", label: "STBB Unit 2 PDF", url: "/textbooks/grade11/Unit2.pdf", icon:"book"} 
  ],
  lastUpdated: new Date().toISOString(),
};