// app/study/[gradeId]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import type { GradeManifest } from '@/lib/types';

async function getGradeManifest(gradeId: string): Promise<GradeManifest | undefined> {
  const filePath = path.join(process.cwd(), 'study-materials.json');
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const studyMaterials = JSON.parse(fileContent) as GradeManifest[];
    return studyMaterials.find(grade => grade.id === gradeId);
  } catch (error) {
    console.error("Error reading study-materials.json:", error);
    return undefined;
  }
}

export default async function GradeStudyPage({ params }: { params: { gradeId: string } }) {
  const { gradeId } = params;
  const grade = await getGradeManifest(gradeId);

  if (!grade) {
    notFound(); // Show a 404 page if the grade is not found
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{grade.name} Study Materials</h1>

      {grade.sections.map(section => (
        <div key={section.name} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{section.name}</h2>
          <ul className="space-y-3">
            {section.units.map(unit => (
              <li key={unit.id}>
                <Link href={`/study/${grade.id}/${unit.id}`} className="text-blue-600 hover:underline text-lg">
                  {unit.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}