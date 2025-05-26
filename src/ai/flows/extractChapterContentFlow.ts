'use server';
/**
 * Genkit flow for extracting structured content (key points, MCQs, exercises)
 * from PDF text for a given physics chapter.
 *
 * - extractChapterContent: Simulates extracting content from PDF text.
 * - ExtractChapterContentInput: Input type for the flow.
 * - ExtractedChapterContentOutput: Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const ExtractChapterContentInputSchema = z.object({
  pdfTextContent: z.string().describe('The textual content extracted from the chapter PDF. For simulation, this might be a filename or short description of the content source.'),
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

const FormulaSchema = z.object({
  formula: z.string().describe('The formula in LaTeX format (do not use $ or $$ delimiters, just the raw LaTeX).'),
  description: z.string().describe('A brief description of what the formula represents and its context in the chapter.'),
});

const DiagramDescriptionSchema = z.object({
  title: z.string().describe('A short title for the diagram or figure.'),
  description: z.string().describe('A detailed description of the diagram, its components, and what it illustrates.'),
});

const ExtractedChapterContentOutputSchema = z.object({
  summary: z.string().describe('A 2-4 sentence summary of the chapter, suitable for quick review. Use markdown for formatting if helpful.'),
  keyPoints: z.string().describe('A summary of key points, definitions, and important concepts from the chapter, formatted for readability (e.g., using markdown). This should be comprehensive and accurate.'),
  formulas: z.array(FormulaSchema).describe('An array of important formulas from the chapter, each in LaTeX format with a description. Use only raw LaTeX, no $ or $$.'),
  mcqs: z.array(MCQSchema).describe('An array of 5 multiple-choice questions relevant to the chapter. Ensure questions are clear, options distinct, and explanations concise.'),
  shortAnswers: z.array(QuestionAnswerSchema).describe('An array of 3 short answer questions (CRQs) with their model answers.'),
  longAnswers: z.array(QuestionAnswerSchema).describe('An array of 2 long answer questions (ERQs) with their model answers.'),
  realWorldExamples: z.array(z.string()).describe('An array of 2-4 real-world examples or applications of the chapter concepts.'),
  diagramDescriptions: z.array(DiagramDescriptionSchema).describe('An array of 1-3 diagram/figure descriptions relevant to the chapter.'),
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
  prompt: `You are an AI assistant specialized in processing physics educational material and structuring it for learning applications.\n\nGiven the following text content (or a description of the source if actual text is too long for this prompt) from a physics chapter titled "{{chapterName}}", perform the following tasks. Leverage your understanding to draft comprehensive and accurate content suitable for a teacher's review.\n\n1.  **Summary:** Write a 2-4 sentence summary of the chapter.\n2.  **Key Points & Summary:** Generate a concise yet comprehensive summary of the key concepts, important definitions, and core principles discussed in the chapter. Use markdown formatting (bullets, bold, etc.) for clarity.\n3.  **Important Formulas:** List all important formulas from the chapter. For each, provide the formula in raw LaTeX (no $ or $$) and a brief description.\n4.  **Multiple Choice Questions (MCQs):** Create exactly 5 unique MCQs based on the chapter content. Each MCQ must have:\n    *   A clear question.\n    *   Exactly four distinct answer options.\n    *   A single correct answer (indicate its 0-based index).\n    *   A brief explanation for why that answer is correct.\n5.  **Short Answer Questions (CRQs):** Create exactly 3 unique short answer questions that require a concise explanation or calculation. Provide the model answer for each.\n6.  **Long Answer Questions (ERQs):** Create exactly 2 unique long answer questions that require a more detailed explanation, derivation, or application of concepts. Provide the model answer for each.\n7.  **Real-World Examples:** List 2-4 real-world examples or applications of the chapter's concepts.\n8.  **Diagram Descriptions:** For 1-3 key diagrams or figures, provide a title and a detailed description of what the diagram shows and its relevance.\n\n**Formatting and LaTeX Instructions:**\n- All formulas must be in raw LaTeX (no $ or $$).\n- Use markdown for lists, bold, and clarity in text fields.\n- Structure your entire response as a single JSON object adhering to the defined output schema.\n\nChapter Content Source (or description if content is very long/simulated):\n\n\`\`\`\n{{{pdfTextContent}}}\n\`\`\`\n\nExample structure for a formula item:\n{ "formula": "F=ma", "description": "Newton's second law: force equals mass times acceleration." }\n\nExample structure for an MCQ item:\n{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswerIndex": 0, "explanation": "..." }\n\nExample structure for a QuestionAnswer item (for CRQs/ERQs):\n{ "question": "...", "answer": "..." }\n\nExample structure for a diagram description:\n{ "title": "Free Body Diagram", "description": "A diagram showing all the forces acting on a block on an inclined plane." }\n`,
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
        { id: "mcq_sim3", question: `Simulated: Another question about ${input.chapterName}.`, options: ["Opt1", "Opt2", "Opt3", "Opt4"], correctAnswerIndex: 0, explanation: "Explanation for sim3." },
        { id: "mcq_sim4", question: `Simulated: More details for ${input.chapterName}?`, options: ["Yes", "No", "Maybe", "Always"], correctAnswerIndex: 3, explanation: "Explanation for sim4." },
        { id: "mcq_sim5", question: `Simulated: Final MCQ for ${input.chapterName}.`, options: ["A", "B", "C", "D"], correctAnswerIndex: 2, explanation: "Explanation for sim5." },
      ];
      const mockShortAnswers = [
        { id: "sa_sim1", question: `Simulated: Define 'velocity' for ${input.chapterName}.`, answer: "Velocity is the rate of change of displacement. It is a vector quantity." },
        { id: "sa_sim2", question: `Simulated: Explain a key concept from ${input.chapterName}.`, answer: "This is a simulated answer for a key concept." },
        { id: "sa_sim3", question: `Simulated: Another short question for ${input.chapterName}.`, answer: "Simulated concise answer." },
      ];
      const mockLongAnswers = [
        { id: "la_sim1", question: `Simulated: Explain the main principle of '${input.chapterName}' with an example.`, answer: "Work is done when a force causes an object to move in the direction of the force. Example: Lifting a book from a table. This example is simulated for the chapter." },
        { id: "la_sim2", question: `Simulated: Derive a relevant formula from ${input.chapterName}.`, answer: "This is a simulated derivation for a formula related to the chapter. Step 1: ..., Step 2: ..., Final formula." },
      ];
      const mockFormulas = [
        { id: "f_sim1", formula: "F=ma", description: "Simulated: Newton's second law: force equals mass times acceleration." },
        { id: "f_sim2", formula: "E=mc^2", description: "Simulated: Mass-energy equivalence." },
      ];
      const mockDiagramDescriptions = [
        { id: "d_sim1", title: "Free Body Diagram", description: "A diagram showing all the forces acting on a block on an inclined plane." },
        { id: "d_sim2", title: "Velocity-Time Graph", description: "A graph plotting velocity against time, showing the motion of an object." },
      ];
      return {
        summary: `This is a simulated summary for the chapter ${input.chapterName}.` ,
        keyPoints: `## Key Points for ${input.chapterName} (Simulated)\n\n*   **Concept 1:** Detailed explanation of the first important concept. This should be comprehensive.\n*   **Formula A:** Relevant_formula = variable1 * variable2 (Example formula related to the chapter).\n*   **Definition X:** A precise definition of a key term found in this chapter.\n*   **Principle Y:** An important principle or law relevant to ${input.chapterName}.`,
        formulas: mockFormulas.map(({id, ...rest}) => rest), // Remove id for schema compliance
        mcqs: mockMcqs.map(({id, ...rest}) => rest), // Remove id for schema compliance
        shortAnswers: mockShortAnswers.map(({id, ...rest}) => rest),
        longAnswers: mockLongAnswers.map(({id, ...rest}) => rest),
        realWorldExamples: [`Simulated real-world example 1 for ${input.chapterName}.`, `Simulated real-world example 2 for ${input.chapterName}.`],
        diagramDescriptions: mockDiagramDescriptions.map(({id, ...rest}) => rest), // Remove id for schema compliance
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

