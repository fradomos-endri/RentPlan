import { useEffect, useRef, useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LocationPickerProps {
  city: string;
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

// City coordinates for Albania
const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  'Tirana': { lat: 41.3275, lng: 19.8187, zoom: 14 },
  'Durrës': { lat: 41.3231, lng: 19.4569, zoom: 14 },
  'Vlorë': { lat: 40.4686, lng: 19.4914, zoom: 14 },
  'Elbasan': { lat: 41.1125, lng: 20.0822, zoom: 14 },
  'Shkodër': { lat: 42.0682, lng: 19.5126, zoom: 14 },
  'Fier': { lat: 40.7239, lng: 19.5558, zoom: 14 },
  'Korçë': { lat: 40.6186, lng: 20.7814, zoom: 14 },
  'Berat': { lat: 40.7058, lng: 19.9522, zoom: 14 },
  'Lushnjë': { lat: 40.9419, lng: 19.7028, zoom: 14 },
  'Kavajë': { lat: 41.1850, lng: 19.5569, zoom: 14 },
  'Pogradec': { lat: 40.9022, lng: 20.6522, zoom: 14 },
  'Laç': { lat: 41.6353, lng: 19.7131, zoom: 14 },
  'Kukës': { lat: 42.0772, lng: 20.4211, zoom: 14 },
  'Lezhë': { lat: 41.7836, lng: 19.6436, zoom: 14 },
  'Patos': { lat: 40.6833, lng: 19.6167, zoom: 14 },
  'Krujë': { lat: 41.5092, lng: 19.7928, zoom: 14 },
  'Kuçovë': { lat: 40.8006, lng: 19.9167, zoom: 14 },
  'Burrel': { lat: 41.6103, lng: 20.0089, zoom: 14 },
  'Cërrik': { lat: 41.0219, lng: 19.9808, zoom: 14 },
  'Sarandë': { lat: 39.8753, lng: 20.0056, zoom: 14 },
  'Gjirokastër': { lat: 40.0758, lng: 20.1389, zoom: 14 },
  'Përmet': { lat: 40.2364, lng: 20.3517, zoom: 14 },
  'Tepelenë': { lat: 40.2975, lng: 20.0194, zoom: 14 },
  'Gramsh': { lat: 40.8697, lng: 20.1842, zoom: 14 },
  'Librazhd': { lat: 41.1828, lng: 20.3169, zoom: 14 },
  'Peshkopi': { lat: 41.6850, lng: 20.4289, zoom: 14 },
  'Bulqizë': { lat: 41.4917, lng: 20.2208, zoom: 14 },
};

export function LocationPicker({ city, initialLat, initialLng, onLocationSelect }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [leaflet, setLeaflet] = useState<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedLat, setSelectedLat] = useState<number | null>(initialLat || null);
  const [selectedLng, setSelectedLng] = useState<number | null>(initialLng || null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Load Leaflet dynamically
  useEffect(() => {
    // Add Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    
    script.onload = () => {
      setLeaflet((window as any).L);
    };

    document.head.appendChild(script);

    return () => {
      link.remove();
      script.remove();
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstance) return;

    const cityCoords = CITY_COORDINATES[city] || { lat: 41.3275, lng: 19.8187, zoom: 13 };
    const initialCoords = initialLat && initialLng 
      ? { lat: initialLat, lng: initialLng }
      : cityCoords;

    const map = leaflet.map(mapRef.current).setView([initialCoords.lat, initialCoords.lng], cityCoords.zoom);

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add click handler to place marker
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      setSelectedLat(lat);
      setSelectedLng(lng);
      setIsConfirmed(false);

      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Create custom draggable marker
      const customIcon = leaflet.divIcon({
        className: 'custom-location-picker-icon',
        html: `
          <div style="
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-45deg);
            cursor: move;
            transition: all 0.2s ease;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      const marker = leaflet
        .marker([lat, lng], { 
          icon: customIcon,
          draggable: true 
        })
        .addTo(map);

      // Update coordinates when marker is dragged
      marker.on('dragend', (event: any) => {
        const position = event.target.getLatLng();
        setSelectedLat(position.lat);
        setSelectedLng(position.lng);
        setIsConfirmed(false);
      });

      // Show popup
      marker.bindPopup(`
        <div style="font-family: sans-serif; text-align: center; padding: 8px;">
          <strong style="color: #0f172a; font-size: 14px;">Selected Location</strong>
          <p style="margin: 8px 0 4px 0; color: #64748b; font-size: 12px;">
            Lat: ${lat.toFixed(6)}<br/>
            Lng: ${lng.toFixed(6)}
          </p>
          <p style="margin: 4px 0 0 0; color: #06b6d4; font-size: 11px; font-weight: 500;">
            Drag to adjust position
          </p>
        </div>
      `).openPopup();

      markerRef.current = marker;
    });

    setMapInstance(map);
    
    // Mark map as ready after a short delay
    setTimeout(() => {
      setMapReady(true);
    }, 300);

    return () => {
      setMapReady(false);
      map.remove();
    };
  }, [leaflet]); // Remove 'city' from dependencies to prevent map recreation

  // Update map view when city changes
  useEffect(() => {
    if (!mapInstance || !leaflet || !mapReady) return;
    
    // Check if map container is properly initialized
    const container = mapInstance.getContainer();
    if (!container || !container.offsetParent) return;
    
    try {
      const cityCoords = CITY_COORDINATES[city] || { lat: 41.3275, lng: 19.8187, zoom: 13 };
      
      // Invalidate size first to ensure map dimensions are correct
      setTimeout(() => {
        if (mapInstance && mapReady) {
          mapInstance.invalidateSize();
          mapInstance.setView([cityCoords.lat, cityCoords.lng], cityCoords.zoom, {
            animate: true,
            duration: 0.5
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error updating map view:', error);
    }

    // Don't clear marker when city changes - let user keep their selection
    // They can manually adjust it if needed
  }, [city, mapInstance, leaflet, mapReady]);

  // Add initial marker if coordinates provided
  useEffect(() => {
    if (!mapInstance || !leaflet || !initialLat || !initialLng || markerRef.current) return;
    
    // Don't add marker if coordinates are 0,0 (unset)
    if (initialLat === 0 && initialLng === 0) return;

    const customIcon = leaflet.divIcon({
      className: 'custom-location-picker-icon',
      html: `
        <div style="
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-45deg);
          cursor: move;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    const marker = leaflet
      .marker([initialLat, initialLng], { 
        icon: customIcon,
        draggable: true 
      })
      .addTo(mapInstance);

    marker.on('dragend', (event: any) => {
      const position = event.target.getLatLng();
      setSelectedLat(position.lat);
      setSelectedLng(position.lng);
      setIsConfirmed(false);
    });

    markerRef.current = marker;
  }, [mapInstance, leaflet, initialLat, initialLng]);

  const handleConfirmLocation = () => {
    if (selectedLat !== null && selectedLng !== null) {
      onLocationSelect(selectedLat, selectedLng);
      setIsConfirmed(true);
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-gray-200">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4">
        <div className="flex items-center gap-2 text-white">
          <MapPin className="h-5 w-5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Pin Your Business Location</h3>
            <p className="text-sm text-white/90 mt-1">
              Click on the map to place a marker at your business location
            </p>
          </div>
        </div>
      </div>

      <div 
        ref={mapRef} 
        className="w-full h-[400px] bg-gray-100 cursor-crosshair"
        style={{ zIndex: 0 }}
      />

      {/* Coordinates Display & Confirm Button */}
      {selectedLat !== null && selectedLng !== null && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Selected Coordinates:</p>
              <p className="text-xs text-gray-600 mt-1 font-mono">
                Latitude: {selectedLat.toFixed(6)} | Longitude: {selectedLng.toFixed(6)}
              </p>
              {!isConfirmed && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <span>⚠️</span> Drag the marker to adjust or click Confirm Location
                </p>
              )}
              {isConfirmed && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Location confirmed!
                </p>
              )}
            </div>
            {!isConfirmed && (
              <Button
                onClick={handleConfirmLocation}
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
              >
                <Check className="h-4 w-4" />
                Confirm Location
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {selectedLat === null && selectedLng === null && (
        <div className="p-4 bg-blue-50 border-t border-blue-100">
          <p className="text-sm text-blue-800 text-center">
            👆 Click anywhere on the map to place your business location marker
          </p>
        </div>
      )}
    </Card>
  );
}
