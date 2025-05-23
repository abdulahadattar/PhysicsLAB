
'use server';
/**
 * @fileOverview A Genkit flow for extracting structured content (key points, MCQs, exercises)
 * from PDF text for a given physics chapter.
 *
 * - extractChapterContent - Simulates extracting content from PDF text.
 * - ExtractChapterContentInput - Input type for the flow.
 * - ExtractedChapterContentOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const ExtractChapterContentInputSchema = z.object({
  pdfTextContent: z.string().describe('The textual content extracted from the chapter PDF. For simulation, this might be a filename or short description.'),
  chapterName: z.string().describe('The name of the chapter to provide context to the AI.'),
});
export type ExtractChapterContentInput = z.infer<typeof ExtractChapterContentInputSchema>;

// Output Schema for Structured Content
const MCQSchema = z.object({
  question: z.string().describe('The multiple-choice question text.'),
  options: z.array(z.string()).length(4).describe('An array of exactly four option strings.'),
  correctAnswerIndex: z.number().min(0).max(3).describe('The 0-based index of the correct option in the options array.'),
  explanation: z.string().describe('A brief explanation for why the answer is correct.'),
});

const QuestionAnswerSchema = z.object({
  question: z.string().describe('The question text (for short or long answers).'),
  answer: z.string().describe('The answer to the question.'),
});

const ExtractedChapterContentOutputSchema = z.object({
  keyPoints: z.string().describe('A summary of key points, definitions, and important concepts from the chapter, formatted for readability (e.g., using markdown).'),
  mcqs: z.array(MCQSchema).describe('An array of 5-10 multiple-choice questions relevant to the chapter.'),
  shortAnswers: z.array(QuestionAnswerSchema).describe('An array of 3-5 short answer questions (CRQs) with their answers.'),
  longAnswers: z.array(QuestionAnswerSchema).describe('An array of 2-3 long answer questions (ERQs) with their answers.'),
});
export type ExtractedChapterContentOutput = z.infer<typeof ExtractedChapterContentOutputSchema>;


// Main exported function (wrapper for the flow)
export async function extractChapterContent(input: ExtractChapterContentInput): Promise<ExtractedChapterContentOutput> {
  // In a real implementation, you might have more pre-processing here if actual PDF text is passed.
  // For now, the simulation logic is within the prompt/flow.
  return extractChapterContentGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractChapterContentPrompt',
  input: { schema: ExtractChapterContentInputSchema },
  output: { schema: ExtractedChapterContentOutputSchema },
  prompt: `You are an AI assistant specialized in processing physics educational material and structuring it for learning applications.
Given the following text content from a physics chapter titled "{{chapterName}}", please perform the following tasks:

1.  **Key Points & Summary:** Generate a concise summary of the key concepts, important definitions, and core principles discussed in the chapter. This should be well-formatted text (e.g., use bullet points or numbered lists if appropriate for clarity).
2.  **Multiple Choice Questions (MCQs):** Create 5 unique MCQs based on the chapter content. Each MCQ must have:
    *   A clear question.
    *   Exactly four distinct answer options.
    *   A single correct answer (indicate its 0-based index).
    *   A brief explanation for why that answer is correct.
3.  **Short Answer Questions (CRQs):** Create 3 unique short answer questions that require a concise explanation or calculation. Provide the model answer for each.
4.  **Long Answer Questions (ERQs):** Create 2 unique long answer questions that require a more detailed explanation, derivation, or application of concepts. Provide the model answer for each.

Ensure all generated content is directly relevant to the provided chapter content and is suitable for the chapter's topic. Focus on accuracy and educational value.

Chapter Content (or description if content is very long/simulated):
\`\`\`
{{{pdfTextContent}}}
\`\`\`

Structure your entire response as a single JSON object adhering to the defined output schema.
Example structure for an MCQ item:
{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswerIndex": 0, "explanation": "..." }
Example structure for a QuestionAnswer item (for CRQs/ERQs):
{ "question": "...", "answer": "..." }
`,
});

const extractChapterContentGenkitFlow = ai.defineFlow(
  {
    name: 'extractChapterContentFlow',
    inputSchema: ExtractChapterContentInputSchema,
    outputSchema: ExtractedChapterContentOutputSchema,
  },
  async (input) => {
    // Simulate AI processing. If pdfTextContent is very short (like just a filename),
    // it's a cue that this is a UI simulation, so return mock data.
    // A real implementation would pass actual PDF text content.
    if (input.pdfTextContent.length < 100 || input.pdfTextContent.startsWith("Simulated content from")) {
      console.log("extractChapterContentFlow: Simulated mode - returning mock data for chapter:", input.chapterName);
      const mockMcqs = [
        { id: "mcq_sim1", question: `Simulated: What is the S.I. unit of force for ${input.chapterName}?`, options: ["Joule", "Watt", "Newton", "Pascal"], correctAnswerIndex: 2, explanation: "Newton is the S.I. unit of force." },
        { id: "mcq_sim2", question: `Simulated: Which law relates to inertia for ${input.chapterName}?`, options: ["Ohm's Law", "Newton's First Law", "Hooke's Law", "Boyle's Law"], correctAnswerIndex: 1, explanation: "Newton's First Law is also known as the law of inertia." },
      ];
      const mockShortAnswers = [
        { id: "sa_sim1", question: `Simulated: Define 'velocity' for ${input.chapterName}.`, answer: "Velocity is the rate of change of displacement. It is a vector quantity." },
      ];
      const mockLongAnswers = [
        { id: "la_sim1", question: `Simulated: Explain the concept of 'work done' with an example for ${input.chapterName}.`, answer: "Work is done when a force causes an object to move in the direction of the force. Example: Lifting a book from a table." },
      ];
      return {
        keyPoints: `## Key Points for ${input.chapterName} (Simulated)\n\n*   **Concept 1:** Detailed explanation of the first important concept.\n*   **Formula A:** Relevant_formula = variable1 * variable2 (Example formula).\n*   **Definition X:** A precise definition of a key term.`,
        mcqs: mockMcqs.map(({id, ...rest}) => rest), // Remove id for schema compliance
        shortAnswers: mockShortAnswers.map(({id, ...rest}) => rest),
        longAnswers: mockLongAnswers.map(({id, ...rest}) => rest),
      };
    }

    // Actual AI call if real content were passed
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate chapter content.");
    }
    return output;
  }
);
