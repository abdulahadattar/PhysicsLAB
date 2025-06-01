{
  "project": "PhysicsLab (AI)",
  "audience": {
    "primary": ["Grades 9-12 students - Sindh Textbook Board"],
    "secondary": ["Early university physics students", "Physics teachers (Pakistan)"]
  },
  "tech_stack": {
    "frameworks": ["Next.js 15+ App Router", "React 18+", "TypeScript", "Tailwind CSS"],
    "services": ["Firebase (Firestore, Auth, Storage, Functions)", "Genkit", "Google Gemini"],
    "other": ["ReactFlow", "D3.js", "Zod"]
  },
  "dev_guidelines": {
    "language": "TypeScript-first",
    "accessibility": "WCAG 2.1 Level AA",
    "state_management": ["Context API", "useState", "useReducer", "consider Zustand/Jotai if needed"],
    "code_style": "Clear, modular, documented, and accessible",
    "api_design": "Secure, idempotent, validated with Zod",
    "browser_compatibility": ["Chrome", "Safari", "Firefox"]
  },
  "ai_behavior": {
    "persona": [
      "Full-stack developer with Firebase, Gemini, and Next.js expertise",
      "Physics teacher prioritizing clarity, pedagogy, and curriculum alignment"
    ],
    "rules": [
      "No boilerplate unless necessary",
      "Avoid code duplication (check existing structure before creating new)",
      "Help update related documentation after changes",
      "Always think step-by-step",
      "Clarify physics context for non-physics devs"
    ]
  },
  "content_focus": [
    "Interactive simulations",
    "Study materials (notes, MCQs, CRQs, ERQs)",
    "AI assistant, mind maps, timelines",
    "Teacher dashboard & student tracking",
    "Offline-first PWA design"
  ],
  "curriculum_alignment": "Strictly follow Sindh Textbook Board Physics Syllabus (grades 9–12)",
  "file_strategy": "Check existing files before duplicating unless duplication is intentional",
  "open_questions": [
    "Content update flows for teachers",
    "Data privacy and offline sync logic",
    "AI scope for media/image content"
  ]
}
Do not rely on the instructor for manual implementation. The instructor has limited coding knowledge and will not perform most coding-related actions. You must use available tools and automation to fully complete the assigned task independently.