// src/app/(app)/quizzes/[quizId]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust import path as needed
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Assuming you have an auth hook

// Placeholder components (will be created in subsequent steps)
const QuestionDisplay = ({ question, answer, onAnswerChange }: { question: Question, answer: string | string[], onAnswerChange: (value: string | string[] | boolean) => void }) => <div>Render Question {question.questionText}</div>;
const QuizTimer = ({ timeLeft }: { timeLeft: number | null }) => <div>Time Left Placeholder: {timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${timeLeft % 60 < 10 ? '0' : ''}${timeLeft % 60}` : 'N/A'}</div>;

interface Question {
  questionId: string;
  questionText: string;
  questionType: 'single-choice' | 'multiple-choice' | 'short-answer';
  options?: string[];
  points: number;
  // correctAnswer(s) should NOT be fetched to the client for security
}

interface Quiz {
  quizId: string;
  title: string;
  description?: string;
  timeLimit?: number; // in minutes
  questions: Question[]; // Questions will be fetched as a subcollection
}

interface Answer {
  questionId: string;
  answer: string | string[]; // Store student's answer
}

export default function QuizTakingPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const { quizId } = params;
  const { user, loading: authLoading } = useAuth(); // Get authenticated user

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // Time left in seconds

  // Fetch quiz details and questions
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!db) {
        setError("Firestore is not initialized.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Clear previous errors

        // Fetch quiz document
        const quizDocRef = doc(db, 'quizzes', quizId);
        const quizDocSnap = await getDoc(quizDocRef);

        if (!quizDocSnap.exists()) {
          setError("Quiz not found.");
          setLoading(false);
          return;
        }

        const quizData = quizDocSnap.data() as Omit<Quiz, 'questions'>;

        // Fetch questions subcollection
        const questionsCollectionRef = collection(quizDocRef, 'questions');
        const questionsQuery = query(questionsCollectionRef);
        const questionsSnapshot = await getDocs(questionsQuery);

        const questionsData: Question[] = questionsSnapshot.docs.map(doc => ({
          questionId: doc.id,
          ...doc.data() as Omit<Question, 'questionId'>,
          // IMPORTANT: Do NOT fetch correctAnswer(s) here. Server will validate.
        }));

        // Combine quiz data and questions
        const fullQuizData: Quiz = {
          quizId: quizDocSnap.id,
          ...quizData,
          questions: questionsData,
        };

        setQuiz(fullQuizData);

        // Initialize answers state based on fetched questions
        setAnswers(questionsData.map(q => ({
          questionId: q.questionId,
          answer: q.questionType === 'multiple-choice' ? [] : '',
        })));

        // Initialize timer if time limit exists
        if (fullQuizData.timeLimit !== undefined && fullQuizData.timeLimit > 0) {
            setTimeLeft(fullQuizData.timeLimit * 60); // Convert minutes to seconds
        }


      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) { // Wait for auth state to load before fetching
       fetchQuizData();
    }
  }, [quizId, authLoading]); // Re-fetch if quizId changes or auth loading state resolves

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => (prevTime !== null ? prevTime - 1 : null));
    }, 1000);

    // Cleanup interval on component unmount or when time runs out
    return () => clearInterval(timerId);
  }, [timeLeft]);

    // Auto-submit when timer reaches 0
    useEffect(() => {
        if (timeLeft !== null && timeLeft <= 0 && !submitting) {
            console.log("Time's up! Auto-submitting quiz.");
            handleSubmit();
        }
    }, [timeLeft, submitting]);


  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: string | string[] | boolean, type: 'single-choice' | 'multiple-choice' | 'short-answer') => {
    setAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(ans => ans.questionId === questionId); // Find index

      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prevAnswers];
        if (type === 'multiple-choice') {
            const currentAnswers = updatedAnswers[existingAnswerIndex].answer as string[];
             if (typeof value === 'string') { // Checkbox provides string value
                 if (value === 'true') { // Checkbox checked
                     // Add the option value to the array if it's not already there
                    if (!currentAnswers.includes(option)) { // Use 'option' from the checkbox logic
                         updatedAnswers[existingAnswerIndex].answer = [...currentAnswers, option];
                    }
                 } else { // Checkbox unchecked (value is the option string)
                     // Remove the option value from the array
                     updatedAnswers[existingAnswerIndex].answer = currentAnswers.filter(opt => opt !== option); // Use 'option' from the checkbox logic
                 }
             }
        } else {
             updatedAnswers[existingAnswerIndex].answer = value;
        }
        return updatedAnswers;
      } else {
        // This case should ideally not happen if initial state is set correctly
        console.warn("Attempted to update answer for unknown questionId:", questionId);
        return prevAnswers;
      }
    });

  };

  // Handle quiz submission
  const handleSubmit = async () => {
    if (!user) {
      setSubmitError("You must be logged in to submit the quiz.");
      return;
    }
     if (!quiz) {
         setSubmitError("Quiz data not loaded.");
         return;
     }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/quizzes/submitAttempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quiz.quizId,
          answersGiven: answers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      console.log("Quiz submitted successfully:", result);
      // Redirect to results page
      router.push(`/quizzes/results/${result.attemptId}`);

    } catch (err) {
      console.error("Error submitting quiz:", err);
      setSubmitError(`Failed to submit quiz: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
         <Skeleton className="h-10 w-1/2 mb-4" />
         <Skeleton className="h-6 w-1/3 mb-6" />
         {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
         ))}
         <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="p-4 md:p-6">
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Quiz</AlertTitle>
            <AlertDescription>{error || "Quiz data could not be loaded."}</AlertDescription>
          </Alert>
      </div>
    );
  }

   // Format time left for display
   const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
   };


  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold">{quiz.title}</h1>
      {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}

      {quiz.timeLimit !== undefined && quiz.timeLimit > 0 && timeLeft !== null && (
          <Alert>
             <AlertTitle>Time Remaining: {formatTime(timeLeft)}</AlertTitle>
             {timeLeft <= 60 && <AlertDescription className="text-red-600">Hurry up! Time is almost out.</AlertDescription>}
          </Alert>
      )}

      {/* Placeholder for Quiz Timer Component */}
      {quiz.timeLimit !== undefined && quiz.timeLimit > 0 && timeLeft !== null && <QuizTimer timeLeft={timeLeft} />}

      {submitError && (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Submission Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
      )}

      <div className="space-y-8">
        {quiz.questions.map((question, index) => (
          <Card key={question.questionId}>
            <CardContent>
              {/* Placeholder for QuestionDisplay Component */}
              <QuestionDisplay
                question={question}
                answer={answers.find(a => a.questionId === question.questionId)?.answer || (question.questionType === 'multiple-choice' ? [] : '')}
                onAnswerChange={(value) => handleAnswerChange(question.questionId, value, question.questionType)}
              />
            </CardContent>
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={submitting || timeLeft === 0} // Disable if submitting or time is out
        className="w-full md:w-auto"
      >
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </Button>
    </div>
  );
}