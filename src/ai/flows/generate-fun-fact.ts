
'use server';
/**
 * @fileOverview A flow for generating a batch of contextually relevant fun physics content
 * (facts, quotes, historical notes, experiment summaries).
 *
 * - generateFunContentBatch - A function that generates a batch of fun physics content.
 * - GenerateFunContentInput - The input type for the generateFunContentBatch function. (Renamed from GenerateFunFactInput)
 * - FunContentItem - The type for an individual item in the batch.
 * - GenerateFunContentOutput - The return type for the generateFunContentBatch function, containing a list of items.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { STUDY_GRADES } from '@/lib/constants';

// Renamed for clarity, but schema remains the same
const GenerateFunContentInputSchema = z.object({
  topic: z.string().describe('The current physics topic or simulation being interacted with.'),
  gradeLevel: z.number().min(9).max(12).describe('The grade level of the student (9-12).'),
  chapterId: z.string().optional().describe('Optional specific chapter ID from study materials to narrow down the context.'),
});
export type GenerateFunContentInput = z.infer<typeof GenerateFunContentInputSchema>;

const FunContentItemSchema = z.object({
  content: z.string().describe('A fun and interesting physics fact, quote, historical note, or experiment summary.'),
  explanation: z.string().describe('A short explanation or context for the content item.'),
});
export type FunContentItem = z.infer<typeof FunContentItemSchema>;

const GenerateFunContentOutputSchema = z.object({
  items: z.array(FunContentItemSchema).min(3).max(20)
    .describe('An array of 3 to 5 diverse physics content items (facts, quotes, history, experiments), each with a main statement and an explanation.'),
});
export type GenerateFunContentOutput = z.infer<typeof GenerateFunContentOutputSchema>;


const GetStudyMaterialToolInputSchema = z.object({
  gradeLevel: z.number().min(9).max(12).describe('The grade level of the student (9-12).'),
  chapterId: z.string().optional().describe('Optional specific chapter ID to get material for.'),
});

const getStudyMaterialTool = ai.defineTool(
  {
    name: 'getStudyMaterialTool',
    description: 'Fetches relevant study material topics for a given grade level and optional chapter ID. This helps in generating contextually appropriate fun content.',
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

export async function generateFunContentBatch(input: GenerateFunContentInput): Promise<GenerateFunContentOutput> {
  return generateFunContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFunContentPrompt',
  input: {schema: GenerateFunContentInputSchema},
  output: {schema: GenerateFunContentOutputSchema},
  tools: [getStudyMaterialTool],
  prompt: `You are a physics content generator. Your goal is to provide a diverse list of 3 to 5 engaging items suitable for the specified grade level.
These items can be:
- Fun physics facts.
- Interesting quotes from notable physicists (please include who said it).
- Brief historical notes about important physics discoveries or milestones.
- Concise summaries of famous physics experiments and their significance.

Each item must have a primary statement (the 'content') and a short 'explanation' providing context or further detail.
Ensure variety in the types of items you generate in the list.

Context:
Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}
{{#if chapterId}}Chapter ID: {{{chapterId}}}{{/if}}

Instructions:
1. Use the 'getStudyMaterialTool' to fetch relevant study material for the provided 'Grade Level'{{#if chapterId}} and 'Chapter ID'{{/if}}. The tool will return key topics or chapter names.
2. **Prioritize** generating content that is directly related to the concepts mentioned in the study material provided by the tool.
3. Ensure the content and its explanation are suitable for a student at the specified 'Grade Level'.
4. If the 'topic' input is specific and aligns with the study material, use that. If the study material context from the tool is very general, try to find content relevant to the input 'topic' that would typically be covered within those general areas for the grade level.
5. If the tool returns "No specific study material context found" or if the material is too sparse, generate general physics content related to the input 'topic' that is appropriate for the 'Grade Level'.

Output Format:
Respond using JSON format, adhering to the output schema (an object with an 'items' array, where each item has 'content' and 'explanation').
Example item: { "content": "The speed of light in a vacuum is approximately 299,792,458 meters per second.", "explanation": "This constant, denoted by 'c', is fundamental in physics, particularly in Einstein's theory of relativity." }
Example quote: { "content": "Quote by Albert Einstein: 'Imagination is more important than knowledge.'", "explanation": "Einstein emphasized the role of creative thinking in scientific discovery, suggesting that knowledge is limited while imagination encircles the world."}
`,
});

const generateFunContentFlow = ai.defineFlow(
  {
    name: 'generateFunContentFlow',
    inputSchema: GenerateFunContentInputSchema,
    outputSchema: GenerateFunContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.items || output.items.length === 0) {
      // Fallback if AI fails to produce valid output
      console.error("AI did not return valid items. Generating a default item.");
      return {
        items: [{
          content: "Physics is fun!",
          explanation: "Exploring the laws of the universe can be an exciting adventure."
        }]
      };
    }
    return output;
  }
);

