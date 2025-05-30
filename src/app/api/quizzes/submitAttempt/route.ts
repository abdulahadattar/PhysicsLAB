import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin'; // Assuming firebase-admin is set up and exported here
import { doc, getDoc, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore'; // Use firebase/firestore for server-side reads/writes if not using admin SDK's Firestore

// IMPORTANT: This example uses firebase/firestore on the server side.
// For production server-side code, it's generally recommended to use
// the Firebase Admin SDK's Firestore instance for better performance
// and direct access without going through the client SDK layer.
// If you are using firebase-admin's firestore, import it instead of
// firebase/firestore and adjust method calls (e.g., adminDb.collection(...)).

export async function POST(req: NextRequest) {
  try {
    // 1. Verify user authentication
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const { quizId, answersGiven } = await req.json();

    if (!quizId || !answersGiven || !Array.isArray(answersGiven)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // 3. Fetch the questions for the given quizId from Firestore
    // This is crucial for server-side scoring to prevent cheating.
    const quizRef = doc(db, 'quizzes', quizId);
    const quizDoc = await getDoc(quizRef);

    if (!quizDoc.exists()) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const quizData = quizDoc.data();
    const quizTitle = quizData?.title || 'Untitled Quiz'; // Get quiz title

    const questionsRef = collection(quizRef, 'questions');
    const questionsSnapshot = await getDocs(questionsRef);

    if (questionsSnapshot.empty) {
      return NextResponse.json({ error: 'No questions found for this quiz' }, { status: 404 });
    }

    const questionsData: any = {};
    let maxScore = 0;
    questionsSnapshot.forEach(doc => {
      const question = doc.data();
      questionsData[doc.id] = question;
      maxScore += question.points || 0; // Sum up potential points
    });

    // 4. Calculate the score server-side
    let score = 0;
    const validatedAnswers = answersGiven.map((attempt: any) => {
      const question = questionsData[attempt.questionId];
      let isCorrect = false; // Initialize isCorrect for each answer
      let correctAnswer = question?.correctAnswer(s); // Use correct field name

      if (question) {
        // Implement scoring logic based on questionType
        if (question.questionType === 'single-choice' || question.questionType === 'short-answer') {
             // Basic comparison for single correct answer
            if (typeof correctAnswer === 'string' || typeof correctAnswer === 'number') {
                 isCorrect = String(attempt.answer).toLowerCase() === String(correctAnswer).toLowerCase();
            }
        } else if (question.questionType === 'multiple-choice') {
            // For multiple choice, need to compare arrays
            if (Array.isArray(correctAnswer) && Array.isArray(attempt.answer)) {
                 // Simple array comparison (order-insensitive)
                 const submittedAnswers = attempt.answer.map(String).map(s => s.toLowerCase()).sort();
                 const correctAnswers = correctAnswer.map(String).map(s => s.toLowerCase()).sort();
                 isCorrect = JSON.stringify(submittedAnswers) === JSON.stringify(correctAnswers);
            }
        }
        // Add scoring logic for other question types if needed

        if (isCorrect) {
          score += question.points || 0;
        }
      }

      return {
        questionId: attempt.questionId,
        answer: attempt.answer, // Store the submitted answer
        isCorrect: isCorrect, // Store if it was correct
         // Optionally store the correct answer(s) here for review, but be mindful of sensitive data
      };
    });


    // 5. Create a new document in the 'quizAttempts' collection
    const quizAttemptsCollectionRef = collection(db, 'quizAttempts');
    const newAttemptRef = await addDoc(quizAttemptsCollectionRef, {
      userId: userId,
      quizId: quizId,
      quizTitle: quizTitle,
      score: score,
      maxScore: maxScore,
      answersGiven: validatedAnswers, // Store validated answers
      startedAt: Timestamp.fromMillis(req.headers.get('X-Started-At') ? parseInt(req.headers.get('X-Started-At') as string, 10) : Date.now()), // Optional: capture client start time
      completedAt: Timestamp.now(),
    });

    // 6. Return response
    return NextResponse.json({
      attemptId: newAttemptRef.id,
      score: score,
      maxScore: maxScore,
    }, { status: 200 });

  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}