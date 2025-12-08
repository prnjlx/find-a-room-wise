import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  title?: string;
}

const MAPBOX_TOKEN_KEY = 'roomease_mapbox_token';

const LocationMap: React.FC<LocationMapProps> = ({ latitude, longitude, title }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState('');
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(MAPBOX_TOKEN_KEY);
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 14,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add marker for the room location
      new mapboxgl.Marker({ color: '#ea384c' })
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<strong>${title || 'Room Location'}</strong>`)
        )
        .addTo(map.current);

      map.current.on('error', () => {
        setMapError(true);
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      setMapError(true);
    }
  }, [mapboxToken, latitude, longitude, title]);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setMapError(false);
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem(MAPBOX_TOKEN_KEY);
    setMapboxToken('');
    setTokenInput('');
    setMapError(false);
  };

  if (!mapboxToken || mapError) {
    return (
      <div className="space-y-4 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-5 w-5" />
          <span className="font-medium">Map View</span>
        </div>
        
        <p className="text-sm text-muted-foreground">
          To view the location on map, please enter your Mapbox public token.
          Get it from{' '}
          <a 
            href="https://mapbox.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            mapbox.com
          </a>
          {' '}(Tokens section in dashboard)
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
          <div className="flex gap-2">
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveToken} disabled={!tokenInput.trim()}>
              Save
            </Button>
          </div>
        </div>
        
        {mapError && (
          <p className="text-sm text-destructive">
            Invalid token or map failed to load. Please check your token.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Location</span>
        <Button variant="ghost" size="sm" onClick={handleClearToken}>
          Change Token
        </Button>
      </div>
      <div 
        ref={mapContainer} 
        className="w-full h-64 rounded-lg overflow-hidden border"
      />
    </div>
  );
};

export default LocationMap;
