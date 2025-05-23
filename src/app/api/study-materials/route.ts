/**
 * @fileOverview API route for fetching study materials.
 * This route reads the `study-materials.json` file from the `src/data` directory
 * and returns its content. This allows the frontend to dynamically load
 * grade and chapter structures.
 */
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { StudyGrade } from '@/lib/types';

/**
 * Handles GET requests to `/api/study-materials`.
 * Reads and returns the content of `study-materials.json`.
 * @returns {Promise<NextResponse>} A NextResponse object containing the study material data or an error message.
 */
export async function GET() {
  try {
    // Construct the absolute path to the JSON file.
    // process.cwd() gives the root directory of the Next.js project.
    const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'study-materials.json');
    
    // Read the JSON file content as a UTF-8 string.
    const jsonData = await fs.readFile(jsonFilePath, 'utf-8');
    
    // Parse the JSON string into an array of StudyGrade objects.
    const data: StudyGrade[] = JSON.parse(jsonData);
    
    // Return the parsed data as a JSON response.
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch study materials API route:', error);
    // If an error occurs (e.g., file not found, JSON parsing error),
    // return a 500 Internal Server Error response.
    return NextResponse.json(
      { message: 'Failed to fetch study materials. Ensure src/data/study-materials.json exists and is valid.' },
      { status: 500 }
    );
  }
}
