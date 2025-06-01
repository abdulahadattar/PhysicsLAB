// src/app/api/study-materials-manifest/route.ts
import { NextResponse } from 'next/server';
import studyMaterialsManifest from '@/data/study-materials.json'; // Adjust path if your data folder is elsewhere

export async function GET() {
  try {
    // In a real app, you might fetch this from a database or apply further logic
    return NextResponse.json(studyMaterialsManifest);
  } catch (error) {
    console.error("Error serving study materials manifest:", error);
    return NextResponse.json({ error: 'Failed to load study materials structure' }, { status: 500 });
  }
}