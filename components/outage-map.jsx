'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map } from 'lucide-react';

// Use the hardcoded token
mapboxgl.accessToken = "pk.eyJ1IjoiaGl0bWFuMTMxMCIsImEiOiJjbWJzYXE0N20waGw0MnFxdGxzdThrd2V6In0.J4LGkO6DJWUuRoER09zorA";

export default function OutageMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);

  // Static outage data for Indian cities
  const staticOutages = [
    {
      id: 1,
      type: "Power Outage",
      description: "Scheduled maintenance in central area",
      city: "Mumbai",
      latitude: 19.0760,
      longitude: 72.8777,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: "Water Supply",
      description: "Emergency pipe repair affecting multiple areas",
      city: "Delhi",
      latitude: 28.6139,
      longitude: 77.2090,
      timestamp: new Date().toISOString()
    },
    {
      id: 3,
      type: "Internet Disruption",
      description: "Fiber optic cable damage causing network issues",
      city: "Bangalore",
      latitude: 12.9716,
      longitude: 77.5946,
      timestamp: new Date().toISOString()
    },
    {
      id: 4,
      type: "Power Outage",
      description: "Transformer failure in industrial area",
      city: "Chennai",
      latitude: 13.0827,
      longitude: 80.2707,
      timestamp: new Date().toISOString()
    }
  ];

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

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        
        // Add markers for static outages
        staticOutages.forEach(outage => {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-lg">${outage.type}</h3>
              <p class="text-gray-700">${outage.description}</p>
              <p class="text-sm text-gray-500 mt-1">Location: ${outage.city}</p>
              <p class="text-sm text-gray-500">Reported: ${new Date(outage.timestamp).toLocaleString()}</p>
            </div>
          `);

          // Create a custom marker element
          const el = document.createElement('div');
          el.className = 'outage-marker';
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#ef4444';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';

          new mapboxgl.Marker(el)
            .setLngLat([outage.longitude, outage.latitude])
            .setPopup(popup)
            .addTo(map.current);
        });
      });

      return () => map.current?.remove();
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, []);

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
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
} 