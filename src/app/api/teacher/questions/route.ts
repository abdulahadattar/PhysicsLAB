import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Assuming you have a firebase config and initialization
import { collection, addDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase'; // Assuming Firebase Auth is initialized

// Helper function to check for teacher role (example implementation)
const isTeacher = async (userId: string): Promise<boolean> => {
  // Implement your logic to check if the user is a teacher
  // This could involve reading a 'roles' field from a user document,
  // checking a custom claim in the auth token, etc.
  // For this example, we'll just return true, but replace with your actual logic.
  console.log(`Checking if user ${userId} is a teacher...`);
  // Example: Fetch user document and check a field
  // const userDoc = await db.collection('users').doc(userId).get();
  // return userDoc.exists && userDoc.data()?.role === 'teacher';
  return true; // Replace with actual teacher check
};

export async function POST(req: Request) {
  try {
    const { userId } = auth.currentUser || {}; // Get user ID from authenticated user

    if (!userId || !(await isTeacher(userId))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { quizId, questionData } = await req.json();

    if (!quizId || !questionData) {
      return NextResponse.json({ message: 'Missing quizId or questionData' }, { status: 400 });
    }

    // Add question to a 'questions' collection, linking it to the quizId
    // Alternatively, questions could be a subcollection under the quiz document
    const questionsCollectionRef = collection(db, 'questions');
    const docRef = await addDoc(questionsCollectionRef, {
      ...questionData,
      quizId: quizId, // Link question to the quiz
      createdAt: new Date(),
      createdBy: userId,
    });

    return NextResponse.json({ id: docRef.id, message: 'Question created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ message: 'Error creating question', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}