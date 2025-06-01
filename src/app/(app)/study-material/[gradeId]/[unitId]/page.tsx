// src/app/(app)/study-material/[gradeId]/[unitId]/page.tsx
import { notFound } from 'next/navigation';
import UnitContentDisplay from '@/components/study/UnitContentDisplay'; // We will create this client component next
import type { UnitData, StudyGrade, Chapter } from '@/lib/types'; // Import types from your existing types file
import manifest from '@/data/study-materials.json'; // Import the manifest directly for server-side logic

interface UnitDetailPageProps {
  params: {
    gradeId: string;
    unitId: string;
  };
}

async function getUnitData(gradeId: string, unitId: string): Promise<UnitData | null> {
  const grade = (manifest as StudyGrade[]).find(g => g.id === gradeId);
  if (!grade) return null;

  // In the existing study-materials.json, units are listed directly under grades as 'chapters'.
  // Find the chapter that matches the unitId.
  const chapter = grade.chapters.find(c => c.id === unitId);

  if (!chapter || !chapter.dataPath) return null;

  try {
    // Dynamically import the unit-specific data file
    // The path in dataPath is relative to src/data/
    const unitModule = await import(`@/data/${chapter.dataPath}`);
    
    // Assuming the data is exported as a variable like 'gradeXUnitYData'
    // or as a default export. We need a consistent way to access it.
    // For now, let's assume the main export or a variable named 'unitExportData'.
    // You might need to adjust this based on how you export in your data files.
    
    let specificUnitData: UnitData | null = null;

    // Attempt to find an export that matches the UnitData structure
    for (const key in unitModule) {
        if (typeof unitModule[key] === 'object' && unitModule[key] !== null && 'unitId' in unitModule[key]) {
            specificUnitData = unitModule[key] as UnitData;
            break;
        }
    }
    
    // Fallback: Check for a default export if no named export found
    if (!specificUnitData && typeof (unitModule as any).default === 'object' && (unitModule as any).default !== null && 'unitId' in (unitModule as any).default) {
         specificUnitData = (unitModule as any).default as UnitData;
    }

    
    if (!specificUnitData || specificUnitData.unitId !== unitId) {
        console.error(`Data mismatch or not found in ${chapter.dataPath} for unitId ${unitId}`);
        return null;
    }
    
    // Augment UnitData with grade and section/chapter names from manifest for display
    // Assuming sectionName is not in the current manifest chapter object, 
    // we'll use the chapter name itself for now or leave it if the display component handles it.
    // If sections are introduced later in the manifest structure, this logic will need adjustment.
    const unitDataWithContext: UnitData = {
        ...specificUnitData,
        gradeId: grade.id, // Add gradeId
        gradeName: grade.name, // Add gradeName
        sectionName: chapter.name // Use chapter name as section name for now
         // Or if you add a section field to your Chapter type in types.ts and study-materials.json
    };

    return unitDataWithContext;

  } catch (error) {
    console.error(`Error importing unit data for ${chapter.dataPath}:`, error);
    return null;
  }
}

// Optional: For generating static paths if you want to pre-render these pages
// This improves performance but requires rebuilding when data changes.
export async function generateStaticParams() {
  const params: { gradeId: string; unitId: string }[] = [];
  (manifest as StudyGrade[]).forEach(grade => {
    grade.chapters.forEach(chapter => {
      // Use chapter.id as unitId
      params.push({ gradeId: grade.id, unitId: chapter.id }); 
    });
  });
  return params;
}


export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const { gradeId, unitId } = params;
  const unitData = await getUnitData(gradeId, unitId);

  if (!unitData) {
    notFound(); // This will render the nearest not-found.tsx or Next.js default 404 page
  }

  return <UnitContentDisplay unitData={unitData} />;
}