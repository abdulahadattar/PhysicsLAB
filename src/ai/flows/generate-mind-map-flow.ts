
'use server';
/**
 * @fileOverview A Genkit flow for generating a structured mind map for a given physics grade.
 *
 * - generateMindMapData - Generates mind map data in JSON format.
 * - GenerateMindMapInput - Input type for the flow.
 * - MindMapNode - Type for a single node in the mind map.
 * - GenerateMindMapOutput - Output type for the flow, containing the title and nodes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Chapter } from '@/lib/types';

// Input Schema (remains the same)
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


// Output Schemas for Structured Mind Map Data
const MindMapNodeSchema = z.object({
  id: z.string().describe('A unique identifier for the node (e.g., "grade-9", "g9-ch1", "g9-ch1-sub1"). Use kebab-case.'),
  label: z.string().describe('The text to display on the node.'),
  parentId: z.string().optional().describe('The id of the parent node. The root node (grade level) will not have a parentId.'),
});
export type MindMapNode = z.infer<typeof MindMapNodeSchema>;

const GenerateMindMapOutputSchema = z.object({
  mindMapTitle: z.string().describe('A title for the mind map, e.g., "Grade 9 Physics Overview".'),
  nodes: z.array(MindMapNodeSchema).describe('An array of nodes representing the mind map structure. Each node must have an id, label, and optionally a parentId to define hierarchy.'),
});
export type GenerateMindMapOutput = z.infer<typeof GenerateMindMapOutputSchema>;


export async function generateMindMapData(input: GenerateMindMapInput): Promise<GenerateMindMapOutput> {
  return generateMindMapDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMindMapDataPrompt',
  input: { schema: GenerateMindMapInputSchema },
  output: { schema: GenerateMindMapOutputSchema },
  prompt: `You are an AI assistant specialized in creating structured educational content for physics students.
Your task is to generate data for a mind map for '{{{gradeName}}}'.
The output MUST be a JSON object adhering to the provided output schema.

The mind map should have a root node representing the grade itself.
Each chapter for '{{{gradeName}}}' should be a direct child node of the grade.
For each chapter, suggest 2-3 plausible key sub-topics or core concepts as child nodes of that chapter.

Instructions for Node Generation:
- Root Node (Grade Level):
  - id: "grade-{{{gradeId}}}"
  - label: "{{{gradeName}}} Physics"
  - No parentId.
- Chapter Nodes:
  - id: Use a format like "g{{{gradeId}}}-ch-{chapter_index_or_sanitized_name}" (e.g., "g9-ch1", "g11-kinematics"). Ensure IDs are unique.
  - label: The full chapter name (e.g., "{{{chapters.0.name}}}").
  - parentId: The id of the root grade node (e.g., "grade-{{{gradeId}}}").
- Sub-Topic Nodes:
  - id: Use a format like "{chapter_node_id}-sub-{sub_topic_index}" (e.g., "g9-ch1-sub1"). Ensure IDs are unique.
  - label: A concise name for the sub-topic (e.g., "S.I. Units", "Newton's Laws").
  - parentId: The id of the parent chapter node.

Example Node Structure:
{
  "mindMapTitle": "{{{gradeName}}} Physics Mind Map",
  "nodes": [
    { "id": "grade-{{{gradeId}}}", "label": "{{{gradeName}}} Physics" },
    { "id": "g{{{gradeId}}}-ch1", "label": "{{{chapters.0.name}}}", "parentId": "grade-{{{gradeId}}}" },
    { "id": "g{{{gradeId}}}-ch1-sub1", "label": "Key Concept A for Chapter 1", "parentId": "g{{{gradeId}}}-ch1" },
    { "id": "g{{{gradeId}}}-ch1-sub2", "label": "Key Concept B for Chapter 1", "parentId": "g{{{gradeId}}}-ch1" }
    // ... more chapters and sub-topics
  ]
}

Chapters for {{{gradeName}}}:
{{#each chapters}}
- {{{this.id}}}: {{{this.name}}}
{{/each}}

Generate the mind map data now. Ensure valid JSON output.
Do not include any preamble or concluding remarks, only the JSON object.
`,
});

const generateMindMapDataFlow = ai.defineFlow(
  {
    name: 'generateMindMapDataFlow',
    inputSchema: GenerateMindMapInputSchema,
    outputSchema: GenerateMindMapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output || !output.nodes || output.nodes.length === 0) {
      console.error("AI did not return valid mind map nodes for grade:", input.gradeName);
      // Fallback to a simple structure
      return {
        mindMapTitle: `${input.gradeName} Physics - Error Generating Detailed Map`,
        nodes: [
          { id: `grade-${input.gradeId}`, label: `${input.gradeName} Physics` },
          ...input.chapters.map((ch, index) => ({
            id: `g${input.gradeId}-ch${index + 1}`,
            label: ch.name,
            parentId: `grade-${input.gradeId}`
          }))
        ]
      };
    }
    // Ensure the root node is present if AI forgets, based on input
    const rootNodeId = `grade-${input.gradeId}`;
    if (!output.nodes.find(n => n.id === rootNodeId)) {
        output.nodes.unshift({ id: rootNodeId, label: `${input.gradeName} Physics` });
    }

    // Ensure all parentIds actually exist as node ids to prevent rendering errors
    const nodeIds = new Set(output.nodes.map(n => n.id));
    output.nodes = output.nodes.filter(node => {
        if (node.parentId && !nodeIds.has(node.parentId)) {
            console.warn(`Node "${node.label}" has non-existent parentId "${node.parentId}". Removing node.`);
            return false;
        }
        return true;
    });


    return output;
  }
);

