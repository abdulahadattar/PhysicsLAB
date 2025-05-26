'use server';
/**
 * Genkit flow for generating a 4A's model lesson plan for a physics chapter.
 *
 * - generateLessonPlan: Generates a lesson plan.
 * - GenerateLessonPlanInput: Input type for the flow.
 * - GenerateLessonPlanOutput: Output type for the flow.
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
  lessonPlanText: z.string().describe("The generated lesson plan text, structured according to the 4A's model (Activity, Analysis, Abstraction, Application). Should be comprehensive, detailed, and formatted for readability, potentially using markdown-like structures."),
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
  prompt: `You are an AI assistant specialized in creating engaging, detailed, and effective physics lesson plans for {{gradeName}}.
Your task is to generate a comprehensive lesson plan for the chapter/topic: "{{chapterName}}".
The lesson plan MUST strictly follow the 4A's model: Activity, Analysis, Abstraction, and Application.
The approximate duration for this lesson is {{durationMinutes}} minutes.
{{#if learningObjectives}}
The teacher has provided the following specific learning objectives to focus on:
{{{learningObjectives}}}
Please ensure your plan comprehensively addresses these.
{{/if}}

Structure your output with clear headings for each of the 4 A's. Be thorough and creative.
For each 'A', provide:
1.  **Objective(s) for this section:** What should students achieve or understand by the end of this section?
2.  **Teacher Activities:** What will the teacher do, say, demonstrate, or ask? Include probing questions.
3.  **Student Activities:** What will students do? (e.g., observe, discuss in groups, solve problems, conduct a quick experiment, present findings, use a specific simulation from PhysicsLab if applicable).
4.  **Approximate Time:** Estimated time allocation for this section.
5.  **Materials/Resources Needed:** (e.g., whiteboard, markers, specific simulation from PhysicsLab if applicable, everyday objects, worksheets, videos).

Make the "Activity" phase highly engaging, hands-on, or thought-provoking to capture student interest.
The "Analysis" phase should guide students to deeply reflect on the activity and draw initial conclusions.
The "Abstraction" phase is where core concepts, definitions, formulas, and theories are formally introduced and explained in detail. Connect new information to prior knowledge.
The "Application" phase should involve students applying the learned concepts to new, varied problems, real-world scenarios, or design challenges.

Ensure the content is age-appropriate for {{gradeName}} and directly relevant to "{{chapterName}}".
Suggest practical activities and diverse teaching strategies.
Output the entire lesson plan as a single block of text, using markdown for formatting if it helps readability (e.g., **bold headings**, *italicized emphasis*, bullet points for lists).
Be very detailed and provide a plan that a teacher could realistically use in a classroom.
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
        \n- **Activity:** (A hands-on task or engaging question related to the chapter)
        \n- **Analysis:** (Detailed discussion and observation from the activity, leading to inquiry)
        \n- **Abstraction:** (Formal introduction of concepts, definitions, formulas, and theoretical explanations)
        \n- **Application:** (Problem-solving, real-world examples, or project ideas related to the chapter)`,
      };
    }
    return output;
  }
);

