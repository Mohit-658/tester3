'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map } from 'lucide-react';

// Make sure this token is set in your .env.local file
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function OutageMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [outages, setOutages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch outages data
  useEffect(() => {
    setLoading(true);
    fetch('/api/outages')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched outages:', data.outages);
        setOutages(data.outages || []);
      })
      .catch(err => {
        console.error('Error fetching outages:', err);
        setError('Failed to fetch outage data');
      })
      .finally(() => setLoading(false));
  }, []);

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
        center: [78.1828, 26.2183], // Gwalior coordinates
        zoom: 12
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add error handling for map loading
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Error loading map');
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
      });

      return () => map.current?.remove();
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, []);

  // Add markers when outages data is available
  useEffect(() => {
    if (!map.current || !outages.length) return;

    console.log('Adding markers for outages:', outages);

    outages.forEach(outage => {
      if (!outage.latitude || !outage.longitude) {
        console.warn('Outage missing coordinates:', outage);
        return;
      }

      try {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <h3 class="font-bold">${outage.type}</h3>
          <p>${outage.description}</p>
          <p class="text-sm text-gray-500">Reported: ${outage.timestamp ? new Date(outage.timestamp).toLocaleString() : ''}</p>
        `);

        new mapboxgl.Marker()
          .setLngLat([outage.longitude, outage.latitude])
          .setPopup(popup)
          .addTo(map.current);
      } catch (err) {
        console.error('Error adding marker:', err);
      }
    });
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

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg h-[400px] relative overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      {!outages.length && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-white/90 p-4 rounded-lg shadow-lg">
            <Map className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Interactive map showing outage locations in Gwalior</p>
            <p className="text-sm text-gray-500 mt-2">Zoom in to see detailed information</p>
          </div>
        </div>
      )}
    </div>
  );
} 