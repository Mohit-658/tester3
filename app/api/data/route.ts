import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// POST: Add data to the database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await addDoc(collection(db, 'data'), body);
    return NextResponse.json({ success: true, message: 'Data added successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// GET: Retrieve all data from the database
export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'data'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 