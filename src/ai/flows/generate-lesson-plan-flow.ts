
'use server';
/**
 * @fileOverview A Genkit flow for generating a 4A's model lesson plan for a physics chapter.
 *
 * - generateLessonPlan - Generates a lesson plan.
 * - GenerateLessonPlanInput - Input type for the flow.
 * - GenerateLessonPlanOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const GenerateLessonPlanInputSchema = z.object({
  gradeName: z.string().describe('The name of the grade (e.g., "Grade 9").'),
  chapterName: z.string().describe('The name of the chapter or topic (e.g., "Unit 2: Kinematics").'),
  learningObjectives: z.string().optional().describe('Specific learning objectives for this lesson, if provided by the teacher.'),
  durationMinutes: z.number().optional().default(40).describe('Approximate duration of the lesson in minutes.'),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

// Output Schema
const GenerateLessonPlanOutputSchema = z.object({
  lessonPlanText: z.string().describe("The generated lesson plan text, structured according to the 4A's model (Activity, Analysis, Abstraction, Application). Should be formatted for readability, potentially using markdown-like structures."),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

// Main exported function (wrapper for the flow)
export async function generateLessonPlan(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  input: { schema: GenerateLessonPlanInputSchema },
  output: { schema: GenerateLessonPlanOutputSchema },
  prompt: `You are an AI assistant specialized in creating engaging and effective physics lesson plans for {{gradeName}}.
Your task is to generate a detailed lesson plan for the chapter/topic: "{{chapterName}}".
The lesson plan MUST strictly follow the 4A's model: Activity, Analysis, Abstraction, and Application.
The approximate duration for this lesson is {{durationMinutes}} minutes.
{{#if learningObjectives}}
The teacher has provided the following specific learning objectives to focus on:
{{learningObjectives}}
Please ensure your plan addresses these.
{{/if}}

Structure your output with clear headings for each of the 4 A's.
For each 'A', provide:
1.  **Objective(s) for this section:** What should students achieve or understand?
2.  **Teacher Activities:** What will the teacher do or say? Include questions to ask.
3.  **Student Activities:** What will students do? (e.g., observe, discuss, solve, experiment, present).
4.  **Approximate Time:** Estimated time for this section.
5.  **Materials/Resources Needed:** (e.g., whiteboard, markers, specific simulation from PhysicsLab if applicable, everyday objects).

Make the "Activity" phase hands-on or thought-provoking.
The "Analysis" phase should guide students to make sense of the activity.
The "Abstraction" phase is where core concepts, definitions, and formulas are formally introduced and explained.
The "Application" phase should involve students applying the learned concepts to new problems or real-world scenarios.

Ensure the content is age-appropriate for {{gradeName}} and directly relevant to "{{chapterName}}".
Be creative and suggest practical activities where possible.
Output the entire lesson plan as a single block of text, using markdown for formatting if it helps readability (e.g., **bold headings**, *italicized emphasis*, bullet points).
`,
});

const generateLessonPlanGenkitFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.lessonPlanText) {
      // Fallback if AI fails
      return {
        lessonPlanText: `Lesson Plan Generation Failed for ${input.chapterName}. Please try again.
        \nKey areas to cover would be:
        \n- **Activity:** (A hands-on task or engaging question)
        \n- **Analysis:** (Discussion and observation from the activity)
        \n- **Abstraction:** (Formal concepts and definitions)
        \n- **Application:** (Problem-solving or real-world examples)`,
      };
    }
    return output;
  }
);
