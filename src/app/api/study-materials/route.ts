
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { StudyGrade } from '@/lib/types'; // We'll define this type

export async function GET() {
  try {
    // Construct the path to the JSON file
    const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'study-materials.json');
    
    // Read the JSON file
    const jsonData = await fs.readFile(jsonFilePath, 'utf-8');
    
    // Parse the JSON data
    const data: StudyGrade[] = JSON.parse(jsonData);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch study materials:', error);
    return NextResponse.json({ message: 'Failed to fetch study materials' }, { status: 500 });
  }
}
