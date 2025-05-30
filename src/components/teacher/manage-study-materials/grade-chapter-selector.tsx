typescriptreact
'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase'; // Assuming firebase.ts exports db
import { collection, getDocs } from 'firebase/firestore';
import { StudyGrade, Chapter } from '@/lib/types'; // Assuming StudyGrade and Chapter types are defined

interface GradeChapterSelectorProps {
  onChapterSelect: (gradeId: string | null, chapterId: string | null) => void;
}

const GradeChapterSelector: React.FC<GradeChapterSelectorProps> = ({ onChapterSelect }) => {
  const [grades, setGrades] = useState<StudyGrade[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch grades on component mount
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setIsLoading(true);
        const gradesCollection = collection(db, 'grades');
        const gradeSnapshot = await getDocs(gradesCollection);
        const gradesList = gradeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as StudyGrade[];
        setGrades(gradesList);
        setError(null);
      } catch (err) {
        console.error('Error fetching grades:', err);
        setError('Failed to load grades.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // Fetch chapters when a grade is selected
  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedGradeId) {
        setChapters([]);
        setSelectedChapterId(null); // Reset chapter selection when grade changes
        return;
      }

      try {
        // No loading state change here to avoid flickering while waiting for chapters
        const chaptersCollection = collection(db, 'chapters');
        // Assuming 'gradeId' field exists in chapter documents
        const chapterSnapshot = await getDocs(
          // This would ideally be a query: query(chaptersCollection, where('gradeId', '==', selectedGradeId))
          // For now, fetching all and filtering client-side as a placeholder.
          // TODO: Implement Firestore query for chapters by gradeId
          chaptersCollection
        );
        const chaptersList = chapterSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((chapter: any) => chapter.gradeId === selectedGradeId) as Chapter[]; // Client-side filter
        setChapters(chaptersList);
        setError(null);
      } catch (err) {
        console.error(`Error fetching chapters for grade ${selectedGradeId}:`, err);
        setError('Failed to load chapters.');
        setChapters([]);
      }
    };

    fetchChapters();
  }, [selectedGradeId]); // Rerun when selectedGradeId changes

  // Inform parent when chapter selection changes
  useEffect(() => {
    onChapterSelect(selectedGradeId, selectedChapterId);
  }, [selectedGradeId, selectedChapterId, onChapterSelect]); // Include onChapterSelect as it's a prop

  const handleGradeChange = (value: string) => {
    setSelectedGradeId(value);
    setSelectedChapterId(null); // Reset chapter when grade changes
    setChapters([]); // Clear chapters until new ones are fetched
  };

  const handleChapterChange = (value: string) => {
    setSelectedChapterId(value);
  };

  if (isLoading) {
    return <div>Loading grades...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <Label htmlFor="grade-select">Select Grade</Label>
        <Select onValueChange={handleGradeChange} value={selectedGradeId || ''}>
          <SelectTrigger id="grade-select">
            <SelectValue placeholder="Choose a Grade" />
          </SelectTrigger>
          <SelectContent>
            {grades.map(grade => (
              <SelectItem key={grade.id} value={grade.id}>
                {grade.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="chapter-select">Select Chapter</Label>
        <Select
          onValueChange={handleChapterChange}
          value={selectedChapterId || ''}
          disabled={!selectedGradeId || chapters.length === 0}
        >
          <SelectTrigger id="chapter-select">
            <SelectValue placeholder="Choose a Chapter" />
          </SelectTrigger>
          <SelectContent>
            {chapters.map(chapter => (
              <SelectItem key={chapter.id} value={chapter.id}>
                {chapter.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default GradeChapterSelector;