'use server';
/**
 * Learning assistant flow for PhysicsLab.
 *
 * - aiLearningAssistant: Provides explanations and assistance for physics topics.
 * - AiLearningAssistantInput: Input type for the function.
 * - AiLearningAssistantOutput: Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schema for the restricted knowledge tool
const RestrictedKnowledgeInputSchema = z.object({
  topicKeywords: z.array(z.string()).describe('Keywords from the user query to fetch relevant restricted knowledge.'),
  gradeLevel: z.number().optional().describe('The student_s grade level (e.g., 9, 10, 11, 12) to fetch grade-appropriate restricted knowledge.'),
});

const getRestrictedPhysicsKnowledgeTool = ai.defineTool(
  {
    name: 'getRestrictedPhysicsKnowledgeTool',
    description: 'Accesses specialized, restricted physics documents and notes to provide expert-level guidance or deeper explanations on advanced topics. Use this if the query seems to touch on complex concepts beyond standard textbook explanations or asks for very specific details likely found in supplementary teacher resources. Consider the provided gradeLevel to tailor the depth of information retrieved.',
    inputSchema: RestrictedKnowledgeInputSchema,
    outputSchema: z.object({
      guidance: z.string().describe('The expert guidance or information retrieved from restricted documents.'),
      source: z.string().describe('A reference to the source material (e.g., "Advanced Mechanics Notes, Chapter 3"). This source is for internal AI context and NOT to be shown directly to the student unless explicitly part of the guidance text.'),
    }),
  },
  async ({ topicKeywords, gradeLevel }) => {
    // In a real application, this tool would query a vector database,
    // search through local files, or call another API to get restricted information,
    // potentially filtering by gradeLevel.
    const keywordsString = topicKeywords.join(' ').toLowerCase();
    
    if (keywordsString.includes('quantum entanglement')) {
      if (gradeLevel && gradeLevel >= 11) { // Only provide this for higher grades
        return {
          guidance: "Quantum entanglement is a phenomenon where two or more quantum particles become linked in such a way that their fates are intertwined, regardless of the distance separating them. Measuring a property of one particle instantaneously influences the properties of the other(s). This concept, famously called 'spooky action at a distance' by Einstein, is a cornerstone of quantum mechanics and has potential applications in quantum computing and cryptography.",
          source: "Advanced Quantum Physics Notes (Grade 11/12 Focus), Section 7.2"
        };
      } else {
        return {
          guidance: "Quantum entanglement is a very advanced topic in physics. For your current grade level, it might be best to focus on foundational concepts first. Would you like to explore something related to classical mechanics or waves?",
          source: "General Knowledge Base - Grade Level Filter Applied"
        }
      }
    }
    if (keywordsString.includes('general relativity') && keywordsString.includes('black hole')) {
        if (gradeLevel && gradeLevel >= 12) { // Typically a Grade 12+ topic
            return {
                guidance: "Within the framework of General Relativity, a black hole is a region of spacetime where gravity is so strong that nothing, not even light, can escape from it. The boundary of this region is called the event horizon. Singularities, points of infinite density, are predicted at the center of black holes, though a complete theory of quantum gravity is needed to fully understand them.",
                source: "Cosmology & GR Lecture Series (Grade 12 Focus), Part 4"
            }
        } else {
             return {
                guidance: "General relativity and black holes are fascinating but advanced topics. Perhaps we can discuss Newton's law of gravitation or escape velocity, which are foundational to understanding these ideas?",
                source: "General Knowledge Base - Grade Level Filter Applied"
            }
        }
    }
    return {
      guidance: "No specific advanced guidance found for the provided keywords in the restricted knowledge base for your grade level. Proceed with general physics knowledge.",
      source: "General Knowledge Base"
    };
  }
);

// Input and Output Schemas for the main flow
const AiLearningAssistantInputSchema = z.object({
  userQuery: z.string().describe('The user question or prompt about a physics topic, diagram, or problem.'),
  imageDataUri: z.string().optional().describe("An optional image provided by the user, as a data URI (e.g., a diagram, photo of an experiment). Format: 'data:<mimetype>;base64,<encoded_data>'."),
  gradeLevel: z.number().optional().describe('The student grade level (e.g., 9, 10, 11, 12).'),
});
export type AiLearningAssistantInput = z.infer<typeof AiLearningAssistantInputSchema>;

const AiLearningAssistantOutputSchema = z.object({
  explanation: z.string().describe('The explanation or answer to the user query. Should be clear, concise, and educationally valuable, tailored to the student grade level if provided.'),
  relatedConcepts: z.array(z.string()).optional().describe('A list of related physics concepts for further exploration.'),
  confidence: z.string().optional().describe('A qualitative measure of confidence in the answer (e.g., High, Medium, Low).'),
  followUpQuestions: z.array(z.string()).optional().describe('A few thought-provoking follow-up questions based on the explanation.'),
  suggestedTopics: z.array(z.string()).optional().describe('A list of specific, related topics suggested for further study.'),
});
export type AiLearningAssistantOutput = z.infer<typeof AiLearningAssistantOutputSchema>;

export async function aiLearningAssistant(input: AiLearningAssistantInput): Promise<AiLearningAssistantOutput> {
  return aiLearningAssistantFlow(input);
}

// Prompt and flow definitions for the learning assistant
const prompt = ai.definePrompt({
  name: 'aiLearningAssistantPrompt',
  input: { schema: AiLearningAssistantInputSchema },
  output: { schema: AiLearningAssistantOutputSchema },
  tools: [getRestrictedPhysicsKnowledgeTool],
  system: `You are PhysicsLab AI, a friendly, highly knowledgeable, and articulate physics learning assistant.
Your primary goal is to help students understand physics concepts, answer their detailed questions (including open-ended and "what if..." scenarios), and explain diagrams or experiments.
Your responses should be educational, accurate, insightful, and meticulously tailored for the student's grade level. Utilize the provided context window effectively for multi-turn conversations.
{{#if gradeLevel}}You are assisting a Grade {{gradeLevel}} student. Adapt your language, depth of explanation, and complexity of examples accordingly.{{else}}Assume a general high school to early college level (grades 9-12).{{/if}}

Core Instructions:
1.  Analyze the user's query and provide a clear, step-by-step explanation.
2.  If an image is provided, integrate it into your explanation.
3.  Offer adaptive hints and problem-solving guidance.
4.  Suggest related concepts, follow-up questions, and further topics for study.
5.  Estimate your confidence in the answer.
6.  Stay focused on physics topics and encourage positive learning.
`,
});

const aiLearningAssistantFlow = ai.defineFlow(
  {
    name: 'aiLearningAssistantFlow',
    inputSchema: AiLearningAssistantInputSchema,
    outputSchema: AiLearningAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      return {
        explanation: "I'm sorry, I couldn't generate a response at this moment. Please try again.",
        relatedConcepts: [],
        confidence: "Low",
        followUpQuestions: [],
        suggestedTopics: [],
      };
    }

    return {
        explanation: output.explanation,
        relatedConcepts: output.relatedConcepts || [],
        confidence: output.confidence || "Medium",
        followUpQuestions: output.followUpQuestions || [],
        suggestedTopics: output.suggestedTopics || [],
    };
  }
);
