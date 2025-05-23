
'use server';
/**
 * @fileOverview A Genkit flow for generating a textual mind map for a given physics grade.
 *
 * - generateMindMapText - Generates a text-based mind map.
 * - GenerateMindMapInput - Input type for the flow.
 * - GenerateMindMapOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Chapter } from '@/lib/types'; // Assuming types.ts is in src/lib

// Input and Output Schemas
const ChapterSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const GenerateMindMapInputSchema = z.object({
  gradeId: z.string().describe('The ID of the grade (e.g., "9", "10").'),
  gradeName: z.string().describe('The name of the grade (e.g., "Grade 9").'),
  chapters: z.array(ChapterSchema).describe('A list of chapters for the specified grade.'),
});
export type GenerateMindMapInput = z.infer<typeof GenerateMindMapInputSchema>;

const GenerateMindMapOutputSchema = z.object({
  mindMapText: z.string().describe('A textual representation of the mind map, using indentation or bullet points for hierarchy.'),
});
export type GenerateMindMapOutput = z.infer<typeof GenerateMindMapOutputSchema>;


export async function generateMindMapText(input: GenerateMindMapInput): Promise<GenerateMindMapOutput> {
  return generateMindMapTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMindMapTextPrompt',
  input: { schema: GenerateMindMapInputSchema },
  output: { schema: GenerateMindMapOutputSchema },
  prompt: `You are an AI assistant specialized in creating educational content for physics students.
Your task is to generate a textual mind map for '{{{gradeName}}}'.
The mind map should provide a hierarchical overview of the main chapters and suggest 2-4 plausible key sub-topics or core concepts for each chapter.
Use clear indentation or bullet points to represent the hierarchy. Chapters should be top-level items.

Chapters for {{{gradeName}}}:
{{#each chapters}}
- {{{this.name}}}
{{/each}}

Generate the textual mind map now. Structure it clearly. For example:
{{{chapters.0.name}}}
  - Sub-topic A
  - Sub-topic B
  - Sub-topic C
{{{chapters.1.name}}}
  - Sub-topic X
  - Sub-topic Y

Do not include any preamble or concluding remarks, only the mind map text itself.
`,
});

const generateMindMapTextFlow = ai.defineFlow(
  {
    name: 'generateMindMapTextFlow',
    inputSchema: GenerateMindMapInputSchema,
    outputSchema: GenerateMindMapOutputSchema,
  },
  async (input) => {
    // The getStudyMaterialTool is not strictly needed here if chapter data is passed directly.
    // If we wanted the AI to *also* fetch the chapters, we would include the tool and adjust the prompt.
    // For this iteration, we assume chapters are passed in the input.

    const { output } = await prompt(input);
    
    if (!output || !output.mindMapText) {
      console.error("AI did not return valid mind map text for grade:", input.gradeName);
      return {
        mindMapText: `Could not generate a mind map for ${input.gradeName} at this time. Please try again.`
      };
    }
    return output;
  }
);

