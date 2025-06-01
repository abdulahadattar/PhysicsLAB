// app/study/page.tsx
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import type { GradeManifest } from '@/lib/types';

async function getStudyMaterialsManifest(): Promise<GradeManifest[]> {
  const filePath = path.join(process.cwd(), 'study-materials.json');
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as GradeManifest[];
  } catch (error) {
    console.error("Error reading study-materials.json:", error);
    return []; // Return empty array if file not found or error
  }
}

export default async function StudyHomePage() {
  const studyMaterials = await getStudyMaterialsManifest();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Study Materials</h1>
      {studyMaterials.length === 0 ? (
        <p>No study materials available yet.</p>
      ) : (
        <ul className="space-y-4">
          {studyMaterials.map((grade) => (
            <li key={grade.id}>
              <Link href={`/study/${grade.id}`} className="text-blue-600 hover:underline text-xl">
                {grade.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}