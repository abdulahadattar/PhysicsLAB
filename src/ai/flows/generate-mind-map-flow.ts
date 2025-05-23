
'use server';
/**
 * @fileOverview A Genkit flow for generating structured mind map data.
 * This flow is intended to be a developer tool to pre-generate mind map content
 * for different grades and curricula, which can then be stored as static JSON.
 * It's NOT intended for direct client-side calls in the student-facing app.
 *
 * - generateMindMapData - Generates mind map node data.
 * - GenerateMindMapInput - Input type for the flow.
 * - AIMindMapNode - Type for a single node in the AI's output structure.
 * - GenerateMindMapOutput - Output type for the flow, containing the title and hierarchical nodes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Chapter } from '@/lib/types'; // Assuming Chapter type is {id: string, name: string}

// Input Schema
const ChapterSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const GenerateMindMapInputSchema = z.object({
  gradeId: z.string().describe('The ID of the grade (e.g., "9", "10").'),
  gradeName: z.string().describe('The name of the grade (e.g., "Grade 9").'),
  curriculumId: z.string().describe('An identifier for the curriculum (e.g., "stbb", "ptbb").'),
  curriculumName: z.string().describe('The display name of the curriculum (e.g., "Sindh Textbook Board").'),
  chapters: z.array(ChapterSchema).describe('A list of chapters for the specified grade and curriculum.'),
});
export type GenerateMindMapInput = z.infer<typeof GenerateMindMapInputSchema>;


// Output Schemas for Structured Mind Map Data (Hierarchical Node List)
// This AIMindMapNode is what the AI is prompted to return directly
const AIMindMapNodeSchema = z.object({
  id: z.string().describe('A unique identifier for the node (e.g., "grade-9-stbb-root", "g9-stbb-ch1", "g9-stbb-ch1-sub1"). Use kebab-case, including grade and curriculum ID prefixes for uniqueness.'),
  label: z.string().describe('The text to display on the node.'),
  parentId: z.string().optional().describe('The id of the parent node. The root node will not have a parentId.'),
});
export type AIMindMapNode = z.infer<typeof AIMindMapNodeSchema>;

const GenerateMindMapOutputSchema = z.object({
  gradeId: z.string(),
  curriculumId: z.string(),
  mindMapTitle: z.string().describe('A title for the mind map, e.g., "Grade 9 Physics Overview (STBB)".'),
  nodes: z.array(AIMindMapNodeSchema).describe('An array of nodes representing the mind map structure. Each node must have an id, label, and optionally a parentId to define hierarchy. Aim for a detailed and nuanced structure, reflecting key concepts and their relationships.'),
});
export type GenerateMindMapOutput = z.infer<typeof GenerateMindMapOutputSchema>;


/**
 * Generates mind map node data for a given grade and chapter list.
 * Intended as a developer tool to populate static JSON data.
 * @param input - The input containing grade, curriculum, and chapter information.
 * @returns A promise that resolves to the generated mind map data.
 */
export async function generateMindMapData(input: GenerateMindMapInput): Promise<GenerateMindMapOutput> {
  // This function now directly calls the flow.
  // The flow itself will handle the AI interaction.
  return generateMindMapDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMindMapDataPrompt_v2', // Renamed to avoid conflict if old prompt exists
  input: { schema: GenerateMindMapInputSchema },
  output: { schema: GenerateMindMapOutputSchema }, // AI outputs the full structure including title
  prompt: `You are an AI assistant specialized in creating structured educational content for physics students.
Your task is to generate data for a rich and detailed mind map for '{{{gradeName}}}' focusing on the '{{{curriculumName}}}'.
The output MUST be a JSON object adhering to the defined output schema (containing gradeId, curriculumId, mindMapTitle, and a 'nodes' array).

The mind map should have a single root node representing the grade and curriculum.
Example Root Node ID: "g{{{gradeId}}}-{{{curriculumId}}}-root"
Example Root Node Label: "{{{gradeName}}} Physics ({{{curriculumName}}})"
This root node will not have a parentId.

Each chapter provided for '{{{gradeName}}}' should be a direct child node of this root node.
For each chapter, generate a comprehensive set of 2-4 plausible key sub-topics or core concepts as child nodes of that chapter.
If appropriate, some sub-topics can themselves have 1-2 further sub-sub-topics to show more nuanced relationships. Make the structure as detailed as helpful for understanding the chapter's scope.

Node ID Naming Convention:
- Ensure all IDs are unique and use kebab-case.
- Root Node: "g{{{gradeId}}}-{{{curriculumId}}}-root"
- Chapter Nodes: "g{{{gradeId}}}-{{{curriculumId}}}-ch-{chapter_index_or_sanitized_name}" (e.g., "g9-stbb-ch1", "g11-ptbb-kinematics").
- Sub-Topic Nodes: "{parent_node_id}-sub-{sub_topic_index}" (e.g., "g9-stbb-ch1-sub1", "g9-stbb-ch1-sub1-detail1").

Output Structure Example:
{
  "gradeId": "{{{gradeId}}}",
  "curriculumId": "{{{curriculumId}}}",
  "mindMapTitle": "{{{gradeName}}} Physics - Detailed Overview ({{{curriculumName}}})",
  "nodes": [
    { "id": "g{{{gradeId}}}-{{{curriculumId}}}-root", "label": "{{{gradeName}}} Physics ({{{curriculumName}}})" },
    { "id": "g{{{gradeId}}}-{{{curriculumId}}}-ch1", "label": "{{{chapters.0.name}}}", "parentId": "g{{{gradeId}}}-{{{curriculumId}}}-root" },
    { "id": "g{{{gradeId}}}-{{{curriculumId}}}-ch1-sub1", "label": "Core Concept A for Chapter 1", "parentId": "g{{{gradeId}}}-{{{curriculumId}}}-ch1" },
    // ... more nodes
  ]
}

Chapters for {{{gradeName}}} ({{{curriculumName}}}):
{{#each chapters}}
- {{{this.id}}}: {{{this.name}}}
{{/each}}

Generate the mind map data now. Ensure valid JSON output and a comprehensive, nuanced hierarchy of nodes.
The 'nodes' array should contain ALL nodes, including the root node.
Do not include any preamble or concluding remarks, only the JSON object.
`,
});

const generateMindMapDataFlow = ai.defineFlow(
  {
    name: 'generateMindMapDataFlow_v2', // Renamed to avoid conflict
    inputSchema: GenerateMindMapInputSchema,
    outputSchema: GenerateMindMapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output || !output.nodes || output.nodes.length === 0) {
      console.error("AI did not return valid mind map nodes for:", input.gradeName, input.curriculumName);
      // Fallback to a simple structure if AI fails
      const rootId = `g${input.gradeId}-${input.curriculumId}-root`;
      return {
        gradeId: input.gradeId,
        curriculumId: input.curriculumId,
        mindMapTitle: `${input.gradeName} Physics (${input.curriculumName}) - Generation Error`,
        nodes: [
          { id: rootId, label: `${input.gradeName} Physics (${input.curriculumName})` },
          ...input.chapters.map((ch, index) => ({
            id: `g${input.gradeId}-${input.curriculumId}-ch${index + 1}`, // Ensure unique ID with curriculum
            label: ch.name,
            parentId: rootId
          }))
        ]
      };
    }

    // Basic validation for the generated AI output
    const rootNodeId = `g${input.gradeId}-${input.curriculumId}-root`;
    if (!output.nodes.find(n => n.id === rootNodeId && !n.parentId)) {
        output.nodes.unshift({ id: rootNodeId, label: `${input.gradeName} Physics (${input.curriculumName})` });
        console.warn(`Root node was missing or misconfigured by AI for ${rootNodeId}, added manually.`);
    }

    const nodeIds = new Set(output.nodes.map(n => n.id));
    output.nodes = output.nodes.filter(node => {
        if (node.parentId && !nodeIds.has(node.parentId)) {
            console.warn(`Node "${node.label}" (id: ${node.id}) has non-existent parentId "${node.parentId}". Removing node.`);
            return false;
        }
        return true;
    });

    // Ensure the output has the correct gradeId and curriculumId from the input
    output.gradeId = input.gradeId;
    output.curriculumId = input.curriculumId;
    
    return output;
  }
);

    