// src/app/(app)/quizzes/results/[attemptId]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust the import path as needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface QuizAttempt {
  // Ensure attemptId is not expected in Firestore data, but added from doc.id
  attemptId: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  answersGiven: Array<{ questionId: string; answer: any; isCorrect: boolean; questionText?: string; correctAnswer?: any; explanation?: string; }>;
  startedAt: any; // Use any for Firebase Timestamp until conversion
  completedAt: any; // Use any for Firebase Timestamp until conversion
}

// Define a minimal interface for the data retrieved directly from Firestore
interface QuizAttemptFirestoreData extends Omit<QuizAttempt, 'attemptId' | 'startedAt' | 'completedAt'> {
    startedAt: { seconds: number; nanoseconds: number }; // Firebase Timestamp structure
    completedAt: { seconds: number; nanoseconds: number }; // Firebase Timestamp structure
}

interface QuizResultsPageProps {
  params: {
    attemptId: string;
  };
}

export default function QuizResultsPage({ params }: QuizResultsPageProps) {
  const { attemptId } = params;
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        setLoading(true);
        const attemptDocRef = doc(db, 'quizAttempts', attemptId);
        const attemptDocSnap = await getDoc(attemptDocRef);

        if (!attemptDocSnap.exists()) {
          setError("Quiz attempt not found.");
          setLoading(false);
          return;
        }

        setAttempt({
          attemptId: attemptDocSnap.id,
          ...attemptDocSnap.data() as QuizAttemptFirestoreData,
        });

      } catch (err) {
        console.error(`Error fetching quiz attempt ${attemptId}:`, err);
        setError("Failed to load quiz results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
           <div className="mt-4">
             <Button asChild>
                <Link href="/quizzes">Back to Quizzes</Link>
             </Button>
           </div>
      </div>
    );
  }

  if (!attempt) {
      // This case should ideally be covered by the error state if attempt is not found
      // but as a fallback:
       return (
        <div className="p-4 md:p-6">
            <Alert>
                <AlertTitle>Loading Results</AlertTitle>
                <AlertDescription>Attempting to load your quiz results...</AlertDescription>
            </Alert>
        </div>
       );
  }

  const completionDate = attempt.completedAt?.toDate ? attempt.completedAt.toDate() : new Date(attempt.completedAt.seconds * 1000); // Handle potential variations in timestamp object

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold">{attempt.quizTitle} Results</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Score: {attempt.score} / {attempt.maxScore}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Completed on: {completionDate.toLocaleString()}</p>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mt-8">Answer Breakdown</h2>
      <div className="space-y-6">
        {attempt.answersGiven && attempt.answersGiven.map((item, index) => ( // Ensure answersGiven is not null/undefined
          <Card key={item.questionId || `answer-item-${index}`}> {/* More robust key */}
            <CardHeader>
              <CardTitle className="text-lg">Question {index + 1}</CardTitle>
               <Badge variant={item.isCorrect ? "default" : "destructive"}>
                 {item.isCorrect ? "Correct" : "Incorrect"}
               </Badge>
            </CardHeader>
            <CardContent className="space-y-3"> {/* Increased spacing slightly */}
              {/* Display question text if available in the attempt data */}
              {item.questionText && <p><strong>Q:</strong> {item.questionText}</p>}
              <p><strong>Your Answer:</strong> {Array.isArray(item.answer) ? item.answer.join(', ') : String(item.answer)}</p>
              {!item.isCorrect && item.correctAnswer !== undefined && (
                 <p className="text-green-600"><strong>Correct Answer:</strong> {Array.isArray(item.correctAnswer) ? item.correctAnswer.join(', ') : String(item.correctAnswer)}</p> {/* Highlight correct answer */}
              )}
              {item.explanation && (
                 <p className="text-sm text-muted-foreground mt-2"><strong>Explanation:</strong> {item.explanation}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
         <Button asChild>
            <Link href="/quizzes">Back to Quizzes</Link>
         </Button>
      </div>
    </div>
  );
}