typescriptreact
'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust import based on your Firebase setup
import { Quiz } from '@/lib/types'; // Adjust import based on your types file
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon } from '@radix-ui/react-icons'; // Or use your preferred icons
import { useUserSession } from '@/contexts/user-session-context'; // Assuming you have a session context
import { toast } from '@/components/ui/use-toast'; // Assuming you have a toast component

const ManageQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isTeacher } = useUserSession(); // Assuming user session context provides role

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user || !isTeacher) {
        // Handle unauthorized access, redirect or show message
        setLoading(false);
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, 'quizzes'));
        const quizzesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Quiz[];
        setQuizzes(quizzesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch quizzes.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user, isTeacher]);

  const handleDeleteQuiz = async (quizId: string) => {
    if (!user || !isTeacher) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to delete quizzes.',
        variant: 'destructive',
      });
      return;
    }

    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
        toast({
          title: 'Success',
          description: 'Quiz deleted successfully.',
        });
      } catch (error) {
        console.error('Error deleting quiz:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete quiz.',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return <div>Loading quizzes...</div>; // Replace with a proper loading skeleton
  }

  if (!user || !isTeacher) {
    return <div>You are not authorized to view this page.</div>; // Replace with a proper unauthorized message/component
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Quizzes</h1>
        <Button asChild>
          <Link href="/teacher-dashboard/quizzes/manage/new">
            <PlusIcon className="mr-2 h-4 w-4" /> Create New Quiz
          </Link>
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <p>No quizzes found. Click "Create New Quiz" to add one.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Grade/Chapter</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map(quiz => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>{quiz.description}</TableCell>
                  <TableCell>{`Grade ${quiz.gradeId || 'N/A'} / Chapter ${quiz.chapterId || 'N/A'}`}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2" asChild>
                      <Link href={`/teacher-dashboard/quizzes/manage/${quiz.id}`}>
                        <PencilIcon className="h-4 w-4" /> <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteQuiz(quiz.id)}>
                      <TrashIcon className="h-4 w-4" /> <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ManageQuizzesPage;