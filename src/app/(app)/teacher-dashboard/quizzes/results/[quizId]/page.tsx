import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '@/lib/firebase'; // Adjust the import path as needed
import { collection, query, where, getDocs } from 'firebase/firestore';
import { QuizAttempt } from '@/lib/types'; // Adjust the import path as needed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const QuizResultsPage = () => {
  const router = useRouter();
  const { quizId } = router.query;

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageScore, setAverageScore] = useState<number | null>(null);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuizAttempts = async () => {
      setLoading(true);
      try {
        // TODO: Implement teacher authentication check here
        const q = query(collection(db, 'quizAttempts'), where('quizId', '==', quizId));
        const querySnapshot = await getDocs(q);
        const fetchedAttempts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as QuizAttempt[];
        setAttempts(fetchedAttempts);

        if (fetchedAttempts.length > 0) {
          const totalScore = fetchedAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
          setAverageScore(totalScore / fetchedAttempts.length);
        } else {
          setAverageScore(0);
        }

      } catch (error) {
        console.error('Error fetching quiz attempts:', error);
        // TODO: Display an error message to the user
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAttempts();
  }, [quizId]);

  if (loading) {
    return <div>Loading results...</div>;
  }

  if (!quizId) {
    return <div>Invalid quiz ID.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Results for Quiz: {attempts[0]?.quizTitle || quizId}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Aggregate Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Total Attempts: {attempts.length}</p>
          {averageScore !== null && (
            <p>Average Score: {averageScore.toFixed(2)}</p>
          )}
          {/* TODO: Add more aggregate metrics */}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Individual Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p>No attempts recorded for this quiz yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead> {/* TODO: Fetch student names */}
                    <TableHead>Score</TableHead>
                    <TableHead>Date Completed</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell>{attempt.userId}</TableCell>
                      <TableCell>{attempt.score} / {attempt.maxScore}</TableCell>
                      <TableCell>{attempt.completedAt ? new Date(attempt.completedAt.seconds * 1000).toLocaleString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Link href={`/quizzes/results/${attempt.id}`} className="text-blue-600 hover:underline">
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weak Area Identification (Scaffold)</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This section will display common areas of difficulty based on student performance on specific questions or topics.</p>
          {/* TODO: Implement logic to analyze question-level performance */}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResultsPage;