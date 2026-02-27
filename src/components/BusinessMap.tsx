import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Business {
  business_id: number;
  business_name: string;
  location?: string; // Legacy field
  city?: string; // New field
  address?: string;
  latitude: number;
  longitude: number;
  car_count?: number;
}

interface BusinessMapProps {
  city: string;
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
}

// City coordinates for Albania
const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  'Tirana': { lat: 41.3275, lng: 19.8187, zoom: 13 },
  'Durrës': { lat: 41.3231, lng: 19.4569, zoom: 13 },
  'Vlorë': { lat: 40.4686, lng: 19.4914, zoom: 13 },
  'Elbasan': { lat: 41.1125, lng: 20.0822, zoom: 13 },
  'Shkodër': { lat: 42.0682, lng: 19.5126, zoom: 13 },
  'Fier': { lat: 40.7239, lng: 19.5558, zoom: 13 },
  'Korçë': { lat: 40.6186, lng: 20.7814, zoom: 13 },
  'Berat': { lat: 40.7058, lng: 19.9522, zoom: 13 },
  'Lushnjë': { lat: 40.9419, lng: 19.7028, zoom: 13 },
  'Kavajë': { lat: 41.1850, lng: 19.5569, zoom: 13 },
  'Pogradec': { lat: 40.9022, lng: 20.6522, zoom: 13 },
  'Laç': { lat: 41.6353, lng: 19.7131, zoom: 13 },
  'Kukës': { lat: 42.0772, lng: 20.4211, zoom: 13 },
  'Lezhë': { lat: 41.7836, lng: 19.6436, zoom: 13 },
  'Patos': { lat: 40.6833, lng: 19.6167, zoom: 13 },
  'Krujë': { lat: 41.5092, lng: 19.7928, zoom: 13 },
  'Kuçovë': { lat: 40.8006, lng: 19.9167, zoom: 13 },
  'Burrel': { lat: 41.6103, lng: 20.0089, zoom: 13 },
  'Cërrik': { lat: 41.0219, lng: 19.9808, zoom: 13 },
  'Sarandë': { lat: 39.8753, lng: 20.0056, zoom: 13 },
  'Gjirokastër': { lat: 40.0758, lng: 20.1389, zoom: 13 },
  'Përmet': { lat: 40.2364, lng: 20.3517, zoom: 13 },
  'Tepelenë': { lat: 40.2975, lng: 20.0194, zoom: 13 },
  'Gramsh': { lat: 40.8697, lng: 20.1842, zoom: 13 },
  'Librazhd': { lat: 41.1828, lng: 20.3169, zoom: 13 },
  'Peshkopi': { lat: 41.6850, lng: 20.4289, zoom: 13 },
  'Bulqizë': { lat: 41.4917, lng: 20.2208, zoom: 13 },
};

export function BusinessMap({ city, businesses, onBusinessClick }: BusinessMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [leaflet, setLeaflet] = useState<any>(null);
  const markersRef = useRef<any[]>([]);

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

    const cityCoords = CITY_COORDINATES[city] || { lat: 41.3275, lng: 19.8187, zoom: 12 };

    const map = leaflet.map(mapRef.current).setView([cityCoords.lat, cityCoords.lng], cityCoords.zoom);

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    setMapInstance(map);

    return () => {
      map.remove();
    };
  }, [leaflet, city]);

  // Add markers for businesses
  useEffect(() => {
    if (!mapInstance || !leaflet || businesses.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Create custom icon
    const customIcon = leaflet.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          box-shadow: 0 6px 14px rgba(6, 182, 212, 0.5), inset 0 1px 2px rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-45deg);
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          <div style="
            position: absolute;
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            background: rgba(255,255,255,0.15);
            transform: rotate(-45deg) scale(0.9);
            opacity: 0.4;
          "></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg); position: relative; z-index: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="white"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    // Add markers for each business
    businesses.forEach((business) => {
      if (business.latitude && business.longitude) {
        const marker = leaflet
          .marker([business.latitude, business.longitude], { icon: customIcon })
          .addTo(mapInstance);

        // Create popup content
        const businessLocation = business.address || business.city || business.location || 'Location not specified';
        const popupContent = `
          <div style="font-family: sans-serif; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #0f172a;">
              ${business.business_name}
            </h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
              📍 ${businessLocation}
            </p>
            ${business.car_count ? `
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #06b6d4; font-weight: 500;">
                🚗 ${business.car_count} car${business.car_count !== 1 ? 's' : ''} available
              </p>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);

        // Handle click
        marker.on('click', () => {
          if (onBusinessClick) {
            onBusinessClick(business);
          }
        });

        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show all markers
    if (businesses.length > 1) {
      const group = leaflet.featureGroup(markersRef.current);
      mapInstance.fitBounds(group.getBounds().pad(0.1));
    }
  }, [mapInstance, leaflet, businesses, onBusinessClick]);

  if (businesses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
        <p className="text-sm text-muted-foreground">
          There are no rental agencies in {city} at the moment.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4">
        <div className="flex items-center gap-2 text-white">
          <MapPin className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Rental Agencies in {city}</h3>
        </div>
        <p className="text-sm text-white/90 mt-1">
          {businesses.length} location{businesses.length !== 1 ? 's' : ''} • Click on pins for details
        </p>
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-[500px] bg-gray-100"
        style={{ zIndex: 0 }}
      />
    </Card>
  );
}
