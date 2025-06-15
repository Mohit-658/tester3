import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentData
} from 'firebase/firestore';

// Type definition for an outage report
export interface OutageReport {
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: Timestamp;
  userId?: string;
  status?: 'active' | 'resolved';
  severity?: 'low' | 'medium' | 'high';
}

// Function to add a new outage report
export const addOutageReport = async (report: Omit<OutageReport, 'timestamp'>) => {
  try {
    const docRef = await addDoc(collection(db, 'outages'), {
      ...report,
      timestamp: Timestamp.now(),
      status: 'active'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding outage report:', error);
    throw error;
  }
};

// Function to get all outage reports
export const getOutageReports = async () => {
  try {
    const q = query(
      collection(db, 'outages'),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (OutageReport & { id: string })[];
  } catch (error) {
    console.error('Error getting outage reports:', error);
    throw error;
  }
};

// Function to get outage reports by type
export const getOutageReportsByType = async (type: string) => {
  try {
    const q = query(
      collection(db, 'outages'),
      where('type', '==', type),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (OutageReport & { id: string })[];
  } catch (error) {
    console.error('Error getting outage reports by type:', error);
    throw error;
  }
};

// Function to get outage reports by location (within a radius)
export const getOutageReportsByLocation = async (
  latitude: number,
  longitude: number,
  radiusInKm: number = 10
) => {
  try {
    // Note: This is a simplified version. For production, you might want to use
    // a geohashing solution or a geospatial query service
    const q = query(
      collection(db, 'outages'),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (OutageReport & { id: string })[];

    // Filter reports within the radius
    return reports.filter(report => {
      const distance = calculateDistance(
        latitude,
        longitude,
        report.latitude,
        report.longitude
      );
      return distance <= radiusInKm;
    });
  } catch (error) {
    console.error('Error getting outage reports by location:', error);
    throw error;
  }
};

// Helper function to calculate distance between two points using the Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
} 