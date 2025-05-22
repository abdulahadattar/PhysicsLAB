
'use server';
/**
 * @fileOverview A flow for generating a batch of contextually relevant fun physics content
 * (facts, quotes, historical notes, experiment summaries).
 *
 * - generateFunContentBatch - A function that generates a batch of fun physics content.
 * - GenerateFunContentInput - The input type for the generateFunContentBatch function.
 * - FunContentItem - The type for an individual item in the batch.
 * - GenerateFunContentOutput - The return type for the generateFunContentBatch function, containing a list of items.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// Removed StudyGrade import as getStudyMaterialTool is being removed.
// Removed path and fs/promises imports as they were for getStudyMaterialTool.


// Input and Output Schemas
const GenerateFunContentInputSchema = z.object({
  topic: z.string().describe('The current physics topic or simulation being interacted with.'),
  gradeLevel: z.number().min(9).max(12).describe('The grade level of the student (9-12).'),
  // chapterId is removed as per user request to undo chapter-specific fun facts.
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


// Tool to get study material context and related functions (getStudyGradesData, getStudyMaterialTool) are removed.

export async function generateFunContentBatch(input: GenerateFunContentInput): Promise<GenerateFunContentOutput> {
  return generateFunContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFunContentPrompt',
  input: {schema: GenerateFunContentInputSchema},
  output: {schema: GenerateFunContentOutputSchema},
  // tools array is removed as getStudyMaterialTool is removed.
  prompt: `You are a physics content generator. Your goal is to provide a diverse list of 3 to 5 engaging items suitable for the specified grade level and general topic.
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

Instructions:
1. Generate content that is relevant to the input 'topic' and appropriate for the 'Grade Level'.
2. Ensure the content and its explanation are suitable for a student at the specified 'Grade Level'.

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
          content: "Physics is fascinating!",
          explanation: "The universe is full of wonders waiting to be understood through the lens of physics."
        }]
      };
    }
    return output;
  }
);

