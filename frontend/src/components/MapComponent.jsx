import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default location (Ongole, Andhra Pradesh - near your location)
const DEFAULT_LOCATION = [15.5057, 80.0499];

const MapComponent = ({ onLocationSelect, emergencies = [], center = DEFAULT_LOCATION }) => {
  const [position, setPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    // Try to get user's location with fallback
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          setPosition([latitude, longitude]);
          if (onLocationSelect) {
            onLocationSelect({ lat: latitude, lng: longitude });
          }
          setLocationError(false);
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          setLocationError(true);
          // Use default location (Ongole, AP)
          setUserLocation(DEFAULT_LOCATION);
          setPosition(DEFAULT_LOCATION);
          if (onLocationSelect) {
            onLocationSelect({ lat: DEFAULT_LOCATION[0], lng: DEFAULT_LOCATION[1] });
          }
        }
      );
    } else {
      setLocationError(true);
      setUserLocation(DEFAULT_LOCATION);
      setPosition(DEFAULT_LOCATION);
      if (onLocationSelect) {
        onLocationSelect({ lat: DEFAULT_LOCATION[0], lng: DEFAULT_LOCATION[1] });
      }
    }
  }, [onLocationSelect]);

  const LocationFinder = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        if (onLocationSelect) {
          onLocationSelect({ lat, lng });
        }
      },
    });
    return null;
  };

  return (
    <div className="relative w-full h-full">
      {locationError && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg text-sm shadow-lg">
          📍 Location unavailable - Using default location (Ongole). Click map to update.
        </div>
      )}
      <MapContainer
        center={userLocation || center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <LocationFinder />
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              {locationError ? '📍 Default Location (Ongole)' : '📍 Your Location'}
              <br />
              <span className="text-xs text-gray-500">Click map to change location</span>
            </Popup>
          </Marker>
        )}
        {Array.isArray(emergencies) && emergencies.map((emergency, index) => (
          <Marker
            key={index}
            position={[emergency.latitude || 12.9716, emergency.longitude || 77.5946]}
          >
            <Popup>
              <div className="p-2 min-w-[150px]">
                <h4 className="font-bold text-sm">#{emergency.complaintId || emergency.id || 'Emergency'}</h4>
                <p className="text-sm">{emergency.emergencyType || 'Unknown'}</p>
                <p className="text-xs text-gray-600">{emergency.description?.substring(0, 50)}...</p>
                <p className="text-xs text-gray-500 mt-1">Status: {emergency.status || 'Pending'}</p>
                <p className="text-xs font-semibold">{emergency.name || 'Anonymous'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;