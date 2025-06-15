'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getOutageReports } from '@/lib/outages';

// Replace with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function OutageMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [outages, setOutages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch outages from Firestore
    const fetchOutages = async () => {
      try {
        const outageData = await getOutageReports();
        setOutages(outageData);
      } catch (error) {
        console.error('Error fetching outages:', error);
        setError('Failed to load outage data. Please try again later.');
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
        ${outage.severity ? `<p class="text-sm font-medium mt-1">Severity: ${outage.severity}</p>` : ''}
        <p class="text-sm ${outage.status === 'resolved' ? 'text-green-600' : 'text-yellow-600'} mt-1">
          Status: ${outage.status || 'active'}
        </p>
      `);

      // Create marker with custom color based on severity
      const markerColor = outage.severity === 'high' ? '#ef4444' : 
                         outage.severity === 'medium' ? '#f59e0b' : 
                         '#10b981';

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = markerColor;
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';

      // Create marker
      new mapboxgl.Marker(el)
        .setLngLat([outage.longitude, outage.latitude])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [outages]);

  if (loading) {
    return <div className="h-[500px] w-full flex items-center justify-center">Loading map...</div>;
  }

  if (error) {
    return (
      <div className="h-[500px] w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
} 