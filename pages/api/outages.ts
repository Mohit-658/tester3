import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const q = query(collection(db, 'outages'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const outages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || null,
    }));
    res.status(200).json({ outages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch outages' });
  }
} 