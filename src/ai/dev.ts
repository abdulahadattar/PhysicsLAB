
import { config } from 'dotenv';
config();

// Ensure the flow is registered with Genkit by importing it
import '@/ai/flows/generate-fun-fact';
import '@/ai/flows/ai-learning-assistant-flow';
import '@/ai/flows/generate-mind-map-flow';
import '@/ai/flows/extractChapterContentFlow';
