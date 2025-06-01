// src/data/grade9/g9-u2-data.ts
import type { UnitDataType } from '@/lib/unitDataTypes';

export const grade9Unit2Data: UnitDataType = {
  id: "g9-u2",
  title: "Unit 2: Kinematics",

  summary: `This unit focuses on describing motion without considering its causes. It introduces concepts like distance, displacement, speed, velocity, and acceleration, and explores their relationships through graphical analysis and equations of motion.`,
  keyPoints: [
    "Kinematics is the study of motion without considering the forces that cause it.",
    "Distance is the total path length covered by an object.",
    "Displacement is the shortest distance between initial and final positions with direction.",
    "Speed is the rate of change of distance.",
    "Velocity is the rate of change of displacement.",
    "Acceleration is the rate of change of velocity.",
    "Graphs of motion (distance-time, velocity-time) provide a visual representation of motion and can be used to determine speed, velocity, and acceleration.",
    "Equations of motion relate initial velocity, final velocity, acceleration, time, and displacement for uniformly accelerated motion."
  ],

  mcqs: [],
  conceptualQuestions: [],
  extendedResponseQuestions: [],
  numericalProblems: [],

  pdfResources: [
    {
      id: "g9u2pdf1_placeholder",
      label: "STBB Unit 2 PDF (Placeholder)",
      url: "/textbooks/grade9/Unit2.pdf", // Placeholder path
      icon: "book-open",
      downloadable: true
    }
  ],
  lastUpdated: new Date().toISOString(),
};