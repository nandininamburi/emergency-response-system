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

const DispatcherSOS = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [formData, setFormData] = useState({
    dispatcherName: '',
    dispatcherPhone: '',
    emergencyType: 'Medical',
    description: '',
    latitude: 15.5057,
    longitude: 80.0499,
    bloodGroup: '',
    aadhar: '',
    address: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    allergies: ''
  });
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setFormData(prev => ({
        ...prev,
        dispatcherName: user.fullName || user.name || '',
        dispatcherPhone: user.phone || '',
        bloodGroup: user.bloodGroup || '',
        aadhar: user.aadhar || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        allergies: user.allergies || ''
      }));
    }

    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, latitude, longitude }));
          setLocation({ lat: latitude, lng: longitude });
          setLocationError(false);
        },
        () => {
          setLocationError(true);
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/emergencies/dispatcher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reportType: 'dispatcher',
          reporterRole: 'dispatcher'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`🚨 SOS Emergency sent!\nComplaint ID: ${result.complaintId}\n\n✅ Alert sent to:\n• Police 👮\n• Hospitals 🏥\n• Fire Brigade 🔥\n• Dispatchers 📋`);
        navigate(`/track/${result.complaintId}`);
      } else {
        alert('❌ Failed to submit SOS. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting SOS:', error);
      alert('❌ Failed to submit SOS. Please try again.');
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
      },
    });
    return location ? <Marker position={[location.lat, location.lng]} /> : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <span className="text-5xl block animate-pulse">🆘</span>
            <h2 className="text-3xl font-bold text-red-600 mt-2">SOS Emergency</h2>
            <p className="text-gray-600 text-sm">Auto-alert will be sent to Police, Hospitals & Dispatchers</p>
          </div>

          {locationError && (
            <div className="mb-4 bg-yellow-50 border border-yellow-400 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                📍 Location unavailable. Click on map to set your location.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700 font-medium">🔴 This is an SOS alert. All emergency services will be notified immediately.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="dispatcherName"
                  value={formData.dispatcherName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  name="dispatcherPhone"
                  value={formData.dispatcherPhone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="Medical">🩺 Medical Emergency</option>
                <option value="Accident">🚗 Road Accident</option>
                <option value="Fire">🔥 Fire</option>
                <option value="Crime">🚨 Crime</option>
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
                placeholder="Describe what happened in detail..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Allergies</label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g., Penicillin, Peanuts"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location (Click on map to update)</label>
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
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-gray-500">
                  Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const { latitude, longitude } = pos.coords;
                          setFormData(prev => ({ ...prev, latitude, longitude }));
                          setLocation({ lat: latitude, lng: longitude });
                          setLocationError(false);
                        },
                        () => alert('📍 Please allow location access')
                      );
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  🔄 Get Current Location
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 animate-pulse"
            >
              {loading ? 'Sending SOS...' : '🆘 Send SOS Emergency'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DispatcherSOS;