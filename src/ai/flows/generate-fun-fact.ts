
'use server';
/**
 * @fileOverview A flow for generating contextually relevant fun physics facts.
 *
 * - generateFunFact - A function that generates a fun physics fact based on the provided context.
 * - GenerateFunFactInput - The input type for the generateFunFact function.
 * - GenerateFunFactOutput - The return type for the generateFunFact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { STUDY_GRADES } from '@/lib/constants';

const GenerateFunFactInputSchema = z.object({
  topic: z.string().describe('The current physics topic or simulation being interacted with.'),
  gradeLevel: z.number().min(9).max(12).describe('The grade level of the student (9-12).'),
  chapterId: z.string().optional().describe('Optional specific chapter ID from study materials to narrow down the context.'),
});
export type GenerateFunFactInput = z.infer<typeof GenerateFunFactInputSchema>;

const GenerateFunFactOutputSchema = z.object({
  fact: z.string().describe('A fun and interesting physics fact related to the topic and grade-specific context.'),
  explanation: z.string().describe('A short explanation of the fact.'),
});
export type GenerateFunFactOutput = z.infer<typeof GenerateFunFactOutputSchema>;

const GetStudyMaterialToolInputSchema = z.object({
  gradeLevel: z.number().min(9).max(12).describe('The grade level of the student (9-12).'),
  chapterId: z.string().optional().describe('Optional specific chapter ID to get material for.'),
});

const getStudyMaterialTool = ai.defineTool(
  {
    name: 'getStudyMaterialTool',
    description: 'Fetches relevant study material topics for a given grade level and optional chapter ID. This helps in generating contextually appropriate fun facts.',
    inputSchema: GetStudyMaterialToolInputSchema,
    outputSchema: z.string().describe('A string containing a summary of relevant study material topics. For example, "Key topics for Grade 9, Chapter Physical Quantities and Measurement include: Physical Quantities and Measurement." or "General topics for Grade 9 include: Physical Quantities and Measurement, Kinematics."'),
  },
  async ({ gradeLevel, chapterId }) => {
    const gradeId = gradeLevel.toString();
    const grade = STUDY_GRADES.find(g => g.id === gradeId);

    if (!grade) {
      return `No specific study material context found for Grade ${gradeLevel}.`;
    }

    let materialContext = `Key concepts for Grade ${gradeLevel}`;
    if (chapterId) {
      const chapter = grade.chapters.find(c => c.id === chapterId);
      if (chapter) {
        materialContext += `, specifically for chapter "${chapter.name}", typically cover topics related to ${chapter.name}.`;
      } else {
        materialContext += ` (Chapter ID ${chapterId} not found). General topics include: ${grade.chapters.map(c => c.name).join(', ')}.`;
      }
    } else {
      if (grade.chapters.length > 0) {
        materialContext += `. General topics include: ${grade.chapters.map(c => c.name).join(', ')}.`;
      } else {
        materialContext += ` include a variety of foundational physics concepts.`;
      }
    }
    return materialContext;
  }
);

export async function generateFunFact(input: GenerateFunFactInput): Promise<GenerateFunFactOutput> {
  return generateFunFactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFunFactPrompt',
  input: {schema: GenerateFunFactInputSchema},
  output: {schema: GenerateFunFactOutputSchema},
  tools: [getStudyMaterialTool],
  prompt: `You are a physics fact generator. Your goal is to provide fun, interesting, and *grade-appropriate* physics facts.
You will also provide a short explanation of the fact.

Context:
Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}
{{#if chapterId}}Chapter ID: {{{chapterId}}}{{/if}}

Instructions:
1. Use the 'getStudyMaterialTool' to fetch relevant study material for the provided 'Grade Level'{{#if chapterId}} and 'Chapter ID'{{/if}}. The tool will return key topics or chapter names.
2. **Prioritize** generating a fact that is directly related to the concepts mentioned in the study material provided by the tool.
3. Ensure the fact and its explanation are suitable for a student at the specified 'Grade Level'.
4. If the 'topic' input is specific and aligns with the study material, use that. If the study material context from the tool is very general (e.g., just a list of chapter names for the grade), try to find a fact relevant to the input 'topic' that would typically be covered within those general areas for the grade level.
5. If the 'topic' is general (e.g., "general physics") and the study material provides specific chapter context (e.g. from a chapterId), focus on that chapter.
6. If the tool returns "No specific study material context found" or if the material is too sparse to derive a specific fact, generate a general physics fact related to the input 'topic' that is appropriate for the 'Grade Level'.

Output Format:
Respond using JSON format, adhering to the output schema.
`,
});

const generateFunFactFlow = ai.defineFlow(
  {
    name: 'generateFunFactFlow',
    inputSchema: GenerateFunFactInputSchema,
    outputSchema: GenerateFunFactOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate fun fact - no output from prompt.");
    }
    return output;
  }
);

