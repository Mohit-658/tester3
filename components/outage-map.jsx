'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Use the hardcoded token
mapboxgl.accessToken = "pk.eyJ1IjoiaGl0bWFuMTMxMCIsImEiOiJjbWJzYXE0N20waGw0MnFxdGxzdThrd2V6In0.J4LGkO6DJWUuRoER09zorA";

export default function OutageMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState('All');
  const [outages, setOutages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch outages from Firebase
  useEffect(() => {
    const fetchOutages = async () => {
      try {
        setLoading(true);
        const outagesRef = collection(db, 'outageReports');
        let q = outagesRef;
        
        if (selectedCity !== 'All') {
          q = query(outagesRef, where('city', '==', selectedCity));
        }
        
        const querySnapshot = await getDocs(q);
        const outageData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setOutages(outageData);
      } catch (err) {
        console.error('Error fetching outages:', err);
        setError('Failed to fetch outage data');
      } finally {
        setLoading(false);
      }
    };

    fetchOutages();
  }, [selectedCity]);

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;
    if (!mapboxgl.accessToken) {
      console.error('Mapbox token is missing');
      setError('Mapbox token is not configured');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [78.9629, 22.5937], // Center of India
        zoom: 4
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add error handling for map loading
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Error loading map');
      });

      return () => map.current?.remove();
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, []);

  // Update markers when outages change
  useEffect(() => {
    if (!map.current || !outages.length) return;

    // Clear existing markers
    const markers = document.getElementsByClassName('outage-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers
    outages.forEach(outage => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold text-lg">${outage.type}</h3>
          <p class="text-gray-700">${outage.description}</p>
          <p class="text-sm text-gray-500 mt-1">Location: ${outage.city}</p>
          <p class="text-sm text-gray-500">Reported: ${new Date(outage.timestamp).toLocaleString()}</p>
        </div>
      `);

      const el = document.createElement('div');
      el.className = 'outage-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = outage.type === 'Power Outage' ? '#ef4444' : '#3b82f6';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';

      new mapboxgl.Marker(el)
        .setLngLat([outage.longitude, outage.latitude])
        .setPopup(popup)
        .addTo(map.current);
    });

    // Fit map to show all markers
    if (outages.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      outages.forEach(outage => {
        bounds.extend([outage.longitude, outage.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [outages]);

  if (error) {
    return (
      <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg h-[400px] relative overflow-hidden">
      <div className="mb-2 flex gap-2 items-center">
        <label htmlFor="citySelect" className="font-medium">Enter City:</label>
        <input
          id="citySelect"
          type="text"
          placeholder="e.g. Hyderabad, Delhi, Gwalior"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="border px-2 py-1 rounded-md"
        />
      </div>
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading outages...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
} 