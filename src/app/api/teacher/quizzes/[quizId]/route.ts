import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Assuming you have authOptions defined

// Helper function to check for teacher role
const isTeacher = async () => {
  const session = await getServerSession(authOptions);
  // Assuming the teacher role is stored in the user's token or session
  // You might need to adjust this based on your actual auth implementation
  return session?.user?.role === 'teacher';
};

export async function GET(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  const { quizId } = params;

  if (!(await isTeacher())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quizDocRef = doc(db, 'quizzes', quizId);
    const quizDocSnap = await getDoc(quizDocRef);

    if (!quizDocSnap.exists()) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(quizDocSnap.data());
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ message: 'Error fetching quiz' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  const { quizId } = params;
  const data = await request.json();

  if (!(await isTeacher())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quizDocRef = doc(db, 'quizzes', quizId);
    await updateDoc(quizDocRef, data);

    return NextResponse.json({ message: 'Quiz updated successfully' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ message: 'Error updating quiz' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  const { quizId } = params;

  if (!(await isTeacher())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quizDocRef = doc(db, 'quizzes', quizId);
    await deleteDoc(quizDocRef);

    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ message: 'Error deleting quiz' }, { status: 500 });
  }
}