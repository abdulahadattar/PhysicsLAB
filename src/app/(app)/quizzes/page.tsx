
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Quiz } from "@/lib/types";
import { useUserSession } from "@/contexts/user-session-context";
import { getQuizAttemptsForUser } from "@/lib/firebase"; // Assuming this utility exists

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAttempts, setUserAttempts] = useState<{ [quizId: string]: number | null }>({});
  const { user } = useUserSession();

  useEffect(() => {
    const fetchQuizzesAndAttempts = async () => {
      setLoading(true);
      try {
        // Fetch quizzes
        const q = query(collection(db, "quizzes"));
        const querySnapshot = await getDocs(q);
        const quizzesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
        setQuizzes(quizzesList);

        // Fetch user attempts if authenticated
        if (user) {
          const attempts = await getQuizAttemptsForUser(user.uid); // Assuming this utility exists and fetches all attempts
          const latestScores: { [quizId: string]: number | null } = {};
          attempts.forEach(attempt => {
            if (!latestScores[attempt.quizId] || attempt.score > latestScores[attempt.quizId]!) {
              latestScores[attempt.quizId] = attempt.score;
            }
          });
          setUserAttempts(latestScores);
        }
      } catch (error) {
        console.error("Error fetching quizzes or attempts:", error);
        // Optionally set an error state
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzesAndAttempts();
  }, [user]);

  // Placeholder for filtering UI
  const renderFiltering = () => {
    return (
      <div className="mb-6">
        {/* Add grade and chapter filter components here later */}
        <p className="text-muted-foreground">Filter by Grade/Chapter (Coming Soon)</p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Available Quizzes</CardTitle>
          <CardDescription>Sharpen your knowledge with daily challenges, topic-specific quizzes, and track your performance.</CardDescription>
        </CardHeader>
      </Card>

      {renderFiltering()}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Loading quizzes...</p> // Add a proper skeleton loader later
        ) : quizzes.length === 0 ? (
          <p>No quizzes available yet.</p>
        ) : (
          quizzes.map((quiz) => (
          <Card 
            key={quiz.id}
            className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              {user && userAttempts[quiz.id] !== undefined && (
                <p className="text-sm text-muted-foreground mb-2">
                  Your Best Score: {userAttempts[quiz.id] === null ? 'Not Attempted' : `${userAttempts[quiz.id]}%`}
                </p>
              )}
              <Link href={`/quizzes/${quiz.id}`} passHref>
                <Button className="w-full">Start Quiz</Button>
              </Link>
            </CardContent>
          ))
        ))}
      </div>
    </div>
  );
}
