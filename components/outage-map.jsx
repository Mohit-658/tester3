'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map } from 'lucide-react';

// Replace with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function OutageMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [outages, setOutages] = useState([]);

  useEffect(() => {
    fetch('/api/outages')
      .then(res => res.json())
      .then(data => setOutages(data.outages || []));
  }, []);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [78.1828, 26.2183], // Gwalior coordinates
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Clean up on unmount
    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (!map.current || !outages.length) return;

    outages.forEach(outage => {
      if (!outage.latitude || !outage.longitude) return;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h3 class="font-bold">${outage.type}</h3>
        <p>${outage.description}</p>
        <p class="text-sm text-gray-500">Reported: ${outage.timestamp ? new Date(outage.timestamp).toLocaleString() : ''}</p>
      `);

      new mapboxgl.Marker()
        .setLngLat([outage.longitude, outage.latitude])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [outages]);

  return (
    <div className="bg-gray-100 rounded-lg h-[400px] relative overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center bg-white/90 p-4 rounded-lg shadow-lg">
          <Map className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Interactive map showing outage locations in Gwalior</p>
          <p className="text-sm text-gray-500 mt-2">Zoom in to see detailed information</p>
        </div>
      </div>
    </div>
  );
} 