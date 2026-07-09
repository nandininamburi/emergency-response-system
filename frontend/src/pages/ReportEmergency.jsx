import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default location (Ongole, Andhra Pradesh)
const DEFAULT_LOCATION = { latitude: 15.5057, longitude: 80.0499 };

const ReportEmergency = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [locationAttempted, setLocationAttempted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyType: 'Accident',
    description: '',
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude
  });
  const [location, setLocation] = useState(null);

  // Get user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setFormData(prev => ({
        ...prev,
        name: user.fullName || user.name || '',
        phone: user.phone || ''
      }));
    }
  }, []);

  // Get location with fallback - only once
  useEffect(() => {
    if (!locationAttempted) {
      setLocationAttempted(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setFormData(prev => ({ ...prev, latitude, longitude }));
            setLocation({ lat: latitude, lng: longitude });
            setLocationError(false);
          },
          (error) => {
            console.error('Error getting location:', error.message);
            setLocationError(true);
            // Use default location (Ongole)
            setFormData(prev => ({ 
              ...prev, 
              latitude: DEFAULT_LOCATION.latitude, 
              longitude: DEFAULT_LOCATION.longitude 
            }));
            setLocation({ 
              lat: DEFAULT_LOCATION.latitude, 
              lng: DEFAULT_LOCATION.longitude 
            });
          }
        );
      } else {
        setLocationError(true);
        setFormData(prev => ({ 
          ...prev, 
          latitude: DEFAULT_LOCATION.latitude, 
          longitude: DEFAULT_LOCATION.longitude 
        }));
        setLocation({ 
          lat: DEFAULT_LOCATION.latitude, 
          lng: DEFAULT_LOCATION.longitude 
        });
      }
    }
  }, [locationAttempted]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualLocation = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({ ...prev, [name]: numValue }));
      setLocation({ 
        lat: name === 'latitude' ? numValue : formData.latitude, 
        lng: name === 'longitude' ? numValue : formData.longitude 
      });
      setLocationError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/emergencies/citizen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reportType: 'citizen',
          reporterRole: 'citizen'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Emergency reported!\nComplaint ID: ${result.complaintId}`);
        navigate(`/track/${result.complaintId}`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setLocation({ lat, lng });
        setLocationError(false);
      },
    });
    return location ? <Marker position={[location.lat, location.lng]} /> : null;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, latitude, longitude }));
          setLocation({ lat: latitude, lng: longitude });
          setLocationError(false);
          alert('📍 Location updated successfully!');
        },
        (error) => {
          alert('📍 Please allow location access in your browser settings.\nUsing default location (Ongole).');
          setLocationError(true);
        }
      );
    } else {
      alert('📍 Geolocation not supported. Please enter location manually.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <span className="text-4xl block">👤</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Report Emergency</h2>
            <p className="text-gray-600 text-sm">Help someone in need - Fill in the basic details</p>
          </div>

          {locationError && (
            <div className="mb-4 bg-yellow-50 border border-yellow-400 rounded-lg p-3 flex items-start gap-2">
              <span className="text-yellow-600 text-lg">📍</span>
              <div>
                <p className="text-sm text-yellow-800 font-medium">Location unavailable</p>
                <p className="text-xs text-yellow-700">
                  Using default location (Ongole). You can:
                </p>
                <ul className="text-xs text-yellow-700 list-disc pl-4 mt-1">
                  <li>Click on the map to set your location</li>
                  <li>Enter coordinates manually below</li>
                  <li>Click "Get Current Location" to try again</li>
                </ul>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Type *</label>
              <select
                name="emergencyType"
                value={formData.emergencyType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Accident">🚗 Road Accident</option>
                <option value="Fire">🔥 Fire</option>
                <option value="Crime">🚨 Crime</option>
                <option value="Medical">🩺 Medical Emergency</option>
                <option value="Other">📌 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what happened..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Location {locationError && '(Click on map to update)'}
              </label>
              
              {/* Map */}
              <div className="h-56 rounded-md overflow-hidden border border-gray-300">
                <MapContainer
                  center={[formData.latitude, formData.longitude]}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <LocationMarker />
                </MapContainer>
              </div>

              {/* Location Controls */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleManualLocation}
                    step="0.000001"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleManualLocation}
                    step="0.000001"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex-1 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                >
                  📍 Get Current Location
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ 
                      ...prev, 
                      latitude: DEFAULT_LOCATION.latitude, 
                      longitude: DEFAULT_LOCATION.longitude 
                    }));
                    setLocation({ 
                      lat: DEFAULT_LOCATION.latitude, 
                      lng: DEFAULT_LOCATION.longitude 
                    });
                    setLocationError(false);
                  }}
                  className="flex-1 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition"
                >
                  📌 Reset to Default
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                '🚨 Submit Emergency Report'
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            💡 Only basic information needed. For detailed help, dispatchers use SOS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportEmergency;