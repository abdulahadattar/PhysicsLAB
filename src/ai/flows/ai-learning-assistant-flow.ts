
'use server';
/**
 * @fileOverview An AI learning assistant flow for PhysicsLab.
 *
 * - aiLearningAssistant - A function that provides AI-powered explanations and assistance.
 * - AiLearningAssistantInput - The input type for the function.
 * - AiLearningAssistantOutput - The return type for the function.
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
  userQuery: z.string().describe('The user_s question or prompt about a physics topic, diagram, or problem.'),
  imageDataUri: z.string().optional().describe("An optional image provided by the user, as a data URI (e.g., a diagram, photo of an experiment). Format: 'data:<mimetype>;base64,<encoded_data>'."),
  gradeLevel: z.number().optional().describe('The student_s grade level (e.g., 9, 10, 11, 12).'),
});
export type AiLearningAssistantInput = z.infer<typeof AiLearningAssistantInputSchema>;

const AiLearningAssistantOutputSchema = z.object({
  explanation: z.string().describe('The AI_s explanation or answer to the user_s query. This should be clear, concise, and educationally valuable, tailored to the student_s grade level if provided.'),
  relatedConcepts: z.array(z.string()).optional().describe('A list of related physics concepts for further exploration, appropriate for the student_s grade level.'),
  confidence: z.string().optional().describe('A qualitative measure of the AI_s confidence in its answer (e.g., High, Medium, Low).'),
  followUpQuestions: z.array(z.string()).optional().describe('A few thought-provoking follow-up questions based on the explanation to encourage deeper understanding, relevant to the grade level.'),
  suggestedTopics: z.array(z.string()).optional().describe('A list of specific, related topics the AI suggests for further study, possibly more targeted than relatedConcepts and suitable for the grade level.'),
});
export type AiLearningAssistantOutput = z.infer<typeof AiLearningAssistantOutputSchema>;

export async function aiLearningAssistant(input: AiLearningAssistantInput): Promise<AiLearningAssistantOutput> {
  return aiLearningAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiLearningAssistantPrompt',
  input: { schema: AiLearningAssistantInputSchema },
  output: { schema: AiLearningAssistantOutputSchema },
  tools: [getRestrictedPhysicsKnowledgeTool],
  system: `You are PhysicsLab AI, a friendly and knowledgeable physics learning assistant.
Your goal is to help students understand physics concepts, answer their questions, and explain diagrams or experiments.
Your responses should be educational, accurate, and tailored for the student's grade level. 
{{#if gradeLevel}}You are assisting a Grade {{gradeLevel}} student. Adapt your language and depth accordingly.{{else}}Assume a general high school to early college level (grades 9-12).{{/if}}

Instructions:
1.  Analyze the user's query: \`{{{userQuery}}}\`.
2.  If an image is provided ({{#if imageDataUri}}see image: {{media url=imageDataUri}}{{else}}no image provided{{/if}}), use it as context for your explanation. Describe what you see if relevant, and relate it to the query.
3.  Provide a clear and concise \`explanation\`, suitable for the student's grade level.
4.  If appropriate, suggest a few \`relatedConcepts\` for general further study, relevant to the grade level.
5.  Based on your explanation, provide 2-3 specific \`followUpQuestions\` to encourage the student to think more deeply about the topic, tailored to their grade.
6.  If relevant, suggest 1-2 specific \`suggestedTopics\` for further, targeted study based on the current query and grade level.
7.  Estimate your \`confidence\` in the answer (High, Medium, Low).
8.  **Learning Focus**: Stick to physics. If the query is unrelated to physics or learning, politely state that you are a physics assistant and cannot help with that, or gently redirect to a physics topic relevant to their grade. Do not answer inappropriate requests.
9.  **Restricted Knowledge**: If the user's query touches on highly advanced or niche topics, consider using the 'getRestrictedPhysicsKnowledgeTool' to fetch specialized information. 
    You should pass the student's gradeLevel (if available, otherwise pass nothing for gradeLevel) and keywords from the userQuery to the tool. 
    Base your explanation on the tool's output if it provides relevant guidance. Do NOT directly tell the student "I am using a special tool" or mention the source name from the tool, just integrate the knowledge seamlessly. If the tool returns "No specific advanced guidance found", rely on your general knowledge.
10. Break down complex problems or explanations into smaller, understandable steps if possible, keeping the student's grade level in mind.
11. Be encouraging and supportive.
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
