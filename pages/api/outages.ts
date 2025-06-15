import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, Query } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { location, type } = req.query;
  try {
    let q: Query = collection(db, 'outages');
    if (location) {
      q = query(q, where('location', '==', location));
    }
    if (type) {
      q = query(q, where('type', '==', type));
    }
    q = query(q, orderBy('timestamp', 'desc'));
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