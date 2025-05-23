
import { config } from 'dotenv';
config();

// Ensure the flow is registered with Genkit by importing it
import '@/ai/flows/generate-fun-fact';
import '@/ai/flows/ai-learning-assistant-flow';
// The mind map flow is now a developer tool to generate static data,
// so it might not need to be registered for the student-facing app's Genkit dev server.
// However, if you run `genkit start` for development/testing of this flow, it should be imported.
import '@/ai/flows/generate-mind-map-flow';
import '@/ai/flows/extractChapterContentFlow';
import '@/ai/flows/generate-lesson-plan-flow';

    