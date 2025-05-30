import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { firebaseAdmin } from '@/lib/firebase-admin'; // Assuming you have firebase-admin configured

// Helper to check if the user is a teacher (implement based on your auth setup)
async function isTeacher(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return false;
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return false;
  }

  try {
    const decodedToken = await getAuth(firebaseAdmin()).verifyIdToken(token);
    return decodedToken.teacher === true;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return false;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { questionId: string } }
) {
  if (!(await isTeacher(request))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { questionId } = params;

  try {
    const questionRef = doc(db, 'questions', questionId);
    const questionSnap = await getDoc(questionRef);

    if (!questionSnap.exists()) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json(questionSnap.data());
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ message: 'Error fetching question' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { questionId: string } }
) {
  if (!(await isTeacher(request))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { questionId } = params;
  const data = await request.json();

  try {
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, data);

    return NextResponse.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ message: 'Error updating question' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { questionId: string } }
) {
  if (!(await isTeacher(request))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { questionId } = params;

  try {
    const questionRef = doc(db, 'questions', questionId);
    await deleteDoc(questionRef);

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ message: 'Error deleting question' }, { status: 500 });
  }
}