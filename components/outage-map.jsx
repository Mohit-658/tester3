'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Replace with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function OutageMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [outages, setOutages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch outages from Firestore
    const fetchOutages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'outages'));
        const outageData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOutages(outageData);
      } catch (error) {
        console.error('Error fetching outages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutages();
  }, []);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40], // Default center (New York area)
      zoom: 9
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Clean up on unmount
    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (!map.current || !outages.length) return;

    // Add markers for each outage
    outages.forEach(outage => {
      if (!outage.latitude || !outage.longitude) return;

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h3 class="font-bold">${outage.type}</h3>
        <p>${outage.description}</p>
        <p class="text-sm text-gray-500">Reported: ${new Date(outage.timestamp?.toDate()).toLocaleString()}</p>
      `);

      // Create marker
      new mapboxgl.Marker()
        .setLngLat([outage.longitude, outage.latitude])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [outages]);

  if (loading) {
    return <div className="h-[500px] w-full flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
} 