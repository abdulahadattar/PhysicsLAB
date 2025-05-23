
/**
 * @fileOverview API route for fetching pre-generated mind map data.
 * This route reads the `mind-map-data.json` file from the `src/data` directory
 * and returns the relevant mind map structure based on gradeId and curriculumId query parameters.
 */
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { AIMindMapNode } from '@/ai/flows/generate-mind-map-flow'; // Re-using this type for structure

interface MindMapDataEntry {
  gradeId: string;
  curriculumId: string;
  mindMapTitle: string;
  nodes: AIMindMapNode[];
}

/**
 * Handles GET requests to `/api/mind-maps`.
 * Filters and returns mind map data based on `gradeId` and `curriculumId`.
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A NextResponse object containing the mind map data or an error message.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gradeId = searchParams.get('gradeId');
  const curriculumId = searchParams.get('curriculumId');

  if (!gradeId || !curriculumId) {
    return NextResponse.json(
      { message: 'Missing gradeId or curriculumId query parameters.' },
      { status: 400 }
    );
  }

  try {
    const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'mind-map-data.json');
    const jsonData = await fs.readFile(jsonFilePath, 'utf-8');
    const allMindMaps: MindMapDataEntry[] = JSON.parse(jsonData);

    const mindMap = allMindMaps.find(
      (map) => map.gradeId === gradeId && map.curriculumId === curriculumId
    );

    if (mindMap) {
      return NextResponse.json(mindMap);
    } else {
      return NextResponse.json(
        { message: `Mind map not found for gradeId ${gradeId} and curriculumId ${curriculumId}.` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Failed to fetch mind map data API route:', error);
    return NextResponse.json(
      { message: 'Failed to fetch mind map data. Ensure src/data/mind-map-data.json exists and is valid.' },
      { status: 500 }
    );
  }
}

    