import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Assuming you have a firebase init in lib
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase'; // Assuming firebase auth is initialized here

// Helper function to check if the user is a teacher (placeholder - implement actual check)
async function isTeacher(userId: string | null | undefined): Promise<boolean> {
  if (!userId) {
    return false;
  }
  // Implement actual logic to check if the user has the teacher role
  // This might involve checking a custom claim or a separate collection in Firestore
  console.log(`Checking if user ${userId} is a teacher... (Placeholder logic)`);
  // For now, return true for any authenticated user as a placeholder
  // REPLACE WITH ACTUAL TEACHER ROLE CHECK
  return true;
}

export async function GET(request: Request) {
  try {
    const user = await auth.currentUser; // Assuming you get the user from the server-side context or auth state
    if (!user || !(await isTeacher(user.uid))) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const quizzesCollection = collection(db, 'quizzes');
    const quizSnapshot = await getDocs(quizzesCollection);
    const quizzes = quizSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await auth.currentUser; // Assuming you get the user from the server-side context or auth state
    if (!user || !(await isTeacher(user.uid))) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, description, chapterId, gradeId, timeLimit } = await request.json();

    if (!title || !chapterId || !gradeId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const quizzesCollection = collection(db, 'quizzes');
    const newQuizRef = await addDoc(quizzesCollection, {
      title,
      description: description || '',
      chapterId,
      gradeId,
      timeLimit: timeLimit || null,
      createdAt: new Date(),
      createdBy: user.uid,
    });

    return NextResponse.json({ id: newQuizRef.id, message: 'Quiz created successfully' });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Implement PUT and DELETE if needed for comprehensive CRUD
// export async function PUT(request: Request) { ... }
// export async function DELETE(request: Request) { ... }