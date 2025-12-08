import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  title?: string;
}

// Fix for default marker icons in Leaflet with bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const LocationMap: React.FC<LocationMapProps> = ({ latitude, longitude, title }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([latitude, longitude], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current);

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map.current);
    
    if (title) {
      marker.bindPopup(`<strong>${title}</strong>`).openPopup();
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, title]);

  return (
    <div className="space-y-2">
      <span className="font-semibold">Location</span>
      <div 
        ref={mapContainer} 
        className="w-full h-64 rounded-lg overflow-hidden border z-0"
      />
    </div>
  );
};

export default LocationMap;
