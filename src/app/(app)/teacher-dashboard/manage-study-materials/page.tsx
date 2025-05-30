typescriptreact
'use client';

import { useUserSession } from '@/contexts/user-session-context';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import GradeChapterSelector from '@/components/teacher/manage-study-materials/grade-chapter-selector';
import StudyMaterialForm from '@/components/teacher/manage-study-materials/study-material-form';
import PdfResourceManager from '@/components/teacher/manage-study-materials/pdf-resource-manager';

export default function ManageStudyMaterialsPage() {
  const { currentUser, userRole, isLoading } = useUserSession();

  // Redirect if not a teacher after loading
  useEffect(() => {
    if (!isLoading && (!currentUser || userRole !== 'teacher')) {
      // Redirect to home or a denied access page
      redirect('/');
    }
  }, [currentUser, userRole, isLoading]);

  if (isLoading || !currentUser || userRole !== 'teacher') {
    // Optionally show a loading spinner or access denied message while redirecting
    return <div>Loading or Access Denied...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Study Materials</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          {/* Placeholder for GradeChapterSelector component */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Select Chapter</h2>
            <GradeChapterSelector />
          </div>
        </div>

        <div className="md:col-span-2">
          {/* Placeholder for StudyMaterialForm component */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit Chapter Content</h2>
            <StudyMaterialForm />
          </div>

          {/* Placeholder for PdfResourceManager component */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Manage PDF Resources</h2>
            <PdfResourceManager />
          </div>
        </div>
      </div>
    </div>
  );
}