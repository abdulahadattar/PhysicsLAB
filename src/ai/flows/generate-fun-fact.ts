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

const GenerateFunFactInputSchema = z.object({
  topic: z.string().describe('The current physics topic or simulation being interacted with.'),
  gradeLevel: z.number().describe('The grade level of the student (9-12).'),
});
export type GenerateFunFactInput = z.infer<typeof GenerateFunFactInputSchema>;

const GenerateFunFactOutputSchema = z.object({
  fact: z.string().describe('A fun and interesting physics fact related to the topic.'),
  explanation: z.string().describe('A short explanation of the fact.'),
});
export type GenerateFunFactOutput = z.infer<typeof GenerateFunFactOutputSchema>;

export async function generateFunFact(input: GenerateFunFactInput): Promise<GenerateFunFactOutput> {
  return generateFunFactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFunFactPrompt',
  input: {schema: GenerateFunFactInputSchema},
  output: {schema: GenerateFunFactOutputSchema},
  prompt: `You are a physics fact generator. You will generate a fun and interesting physics fact related to the given topic and grade level. You will also provide a short explanation of the fact.

Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}

Respond using JSON format.
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
    return output!;
  }
);
