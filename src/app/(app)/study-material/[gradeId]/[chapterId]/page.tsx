import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming firebase.ts exports 'db'
import ChapterDetailClient from '@/components/study/chapter-detail-client'; // Adjust import path as needed
import type { StudyGrade, ChapterContent, Chapter } from '@/lib/types'; // Assuming your types are here

interface ChapterDetailPageProps {
  params: {
    gradeId: string;
    chapterId: string;
  };
}

async function getChapterAndGradeData(gradeId: string, chapterId: string): Promise<{ gradeData: StudyGrade | null; chapterContent: ChapterContent | null; initialChapterData: Chapter | null }> {
  if (!db) {
    console.error("Firestore DB is not initialized.");
    return { gradeData: null, chapterContent: null, initialChapterData: null };
  }

  try {
    // Fetch chapter content
    const chapterDocRef = doc(db, `studyMaterials/${gradeId}/chapters/${chapterId}`);
    const chapterDocSnap = await getDoc(chapterDocRef);
    const chapterContent = chapterDocSnap.exists() ? (chapterDocSnap.data() as ChapterContent) : null;

     // Fetch grade data (for grade name context)
    const gradeDocRef = doc(db, `studyMaterials/${gradeId}`);
    const gradeDocSnap = await getDoc(gradeDocRef);
    const gradeData = gradeDocSnap.exists() ? (gradeDocSnap.data() as StudyGrade) : null;

     // Extract initial chapter data from grade data if available, needed for client component prop
     let initialChapterData: Chapter | null = null;
     if (gradeData && gradeData.chapters) {
         initialChapterData = gradeData.chapters.find(chapter => chapter.id === chapterId) || null;
     }


    return { gradeData, chapterContent, initialChapterData };
  } catch (error) {
    console.error(`Error fetching data for grade ${gradeId}, chapter ${chapterId}:`, error);
    return { gradeData: null, chapterContent: null, initialChapterData: null };
  }
}

export default async function ChapterDetailPage({ params }: ChapterDetailPageProps) {
  const { gradeId, chapterId } = params;

  const { gradeData, chapterContent, initialChapterData } = await getChapterAndGradeData(gradeId, chapterId);

  if (!gradeData || !initialChapterData || !chapterContent) {
      // If either grade or chapter data is missing, show a not found page
      // We need at least initialChapterData for name and chapterContent for details
      // and gradeData for grade name context.
      console.warn(`Data not found for gradeId: ${gradeId}, chapterId: ${chapterId}.`);
      // In a real app, you might differentiate between grade not found and chapter not found
      // and show a more specific error or redirect. For now, notFound is sufficient.
      notFound();
  }

  // Pass fetched data to the client component
  return (
    <ChapterDetailClient
      initialGradeData={gradeData} // Pass grade data for context
      initialChapterData={initialChapterData} // Pass initial chapter data (from grade list)
      chapterContent={chapterContent} // Pass detailed chapter content
      params={{ grade: gradeId, chapterId: chapterId }} // Pass params down if needed by client component
    />
  );
}