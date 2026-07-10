import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DEFAULT_LOCATION = { latitude: 15.5057, longitude: 80.0499 };

const ReportEmergency = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceURL, setVoiceURL] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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

  // Get location with fallback
  useEffect(() => {
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
  }, []);

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setVoiceBlob(audioBlob);
        setVoiceURL(audioUrl);
        setIsRecording(false);
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('❌ Please allow microphone access to record voice message.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Use localhost for development, fallback to deployed
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // ✅ Check if backend is reachable
      try {
        const healthCheck = await fetch(`${API_URL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!healthCheck.ok) {
          throw new Error('Backend not reachable');
        }
        console.log('✅ Backend is reachable');
      } catch (healthError) {
        console.warn('⚠️ Backend health check failed, trying localhost...');
        // Try localhost as fallback
        if (API_URL.includes('render.com')) {
          // If deployed backend fails, try local
          const localAPI = 'http://localhost:5000/api';
          console.log('🔄 Trying local backend...');
          const localHealth = await fetch(`${localAPI}/health`);
          if (localHealth.ok) {
            // Use local API
            await submitEmergency(localAPI);
            return;
          }
        }
        throw new Error('Cannot connect to backend server');
      }

      await submitEmergency(API_URL);

    } catch (error) {
      console.error('Error submitting report:', error);
      alert(`❌ Failed to submit report.\n\nError: ${error.message}\n\n💡 Make sure the backend server is running on http://localhost:5000`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Separate function for submission
  const submitEmergency = async (API_URL) => {
    let voiceBase64 = null;
    if (voiceBlob) {
      voiceBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(voiceBlob);
      });
    }

    let imageBase64 = null;
    if (imageFile) {
      imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageFile);
      });
    }

    const response = await fetch(`${API_URL}/emergencies/citizen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        reportType: 'citizen',
        reporterRole: 'citizen',
        voiceMessage: voiceBase64,
        photo: imageBase64
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit report');
    }

    const result = await response.json();
    
    if (result.success) {
      alert(`✅ Emergency reported!\nComplaint ID: ${result.complaintId}`);
      navigate(`/track/${result.complaintId}`);
    } else {
      throw new Error(result.message || 'Failed to submit report');
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
            <div className="mb-4 bg-yellow-50 border border-yellow-400 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                📍 Location unavailable. Using default location (Ongole). Click on map to set your location.
              </p>
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
              <label className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what happened (optional)..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">💡 You can skip this and use voice message instead</p>
            </div>

            {/* Voice Message Section */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎙️ Voice Message (For uneducated users - speak instead of type)
              </label>
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    🎙️ Start Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-2 animate-pulse"
                  >
                    ⏹️ Stop Recording
                  </button>
                )}
                {isRecording && (
                  <span className="text-red-600 text-sm font-medium animate-pulse">🔴 Recording...</span>
                )}
                {voiceURL && (
                  <div className="flex items-center gap-2">
                    <audio controls className="h-10">
                      <source src={voiceURL} type="audio/wav" />
                    </audio>
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceBlob(null);
                        setVoiceURL(null);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isRecording ? '🔴 Recording... Speak clearly' : 'Click to record your emergency message (Max 30 seconds)'}
              </p>
            </div>

            {/* Image Upload Section */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📸 Photo / Video Upload (For proof)
              </label>
              <div className="flex items-center gap-4 flex-wrap">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Upload photo or video as proof of the incident</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Location {locationError && '(Click on map to update)'}
              </label>
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
                        () => alert('📍 Please allow location access or click on map to set location.')
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : '🚨 Submit Emergency Report'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            💡 You can type, speak voice message, or upload photos/videos
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportEmergency;