import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [direction, setDirection] = useState(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [description, setDescription] = useState('');
  const holdTimerRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const [location, setLocation] = useState({ latitude: 15.5057, longitude: 80.0499 });
  const [locationAttempted, setLocationAttempted] = useState(false);
  const sosContainerRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Get user location
  useEffect(() => {
    if (!locationAttempted) {
      setLocationAttempted(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
          },
          (error) => {
            console.error('Geolocation error:', error.message);
          }
        );
      }
    }
  }, [locationAttempted]);

  const quickActions = [
    { icon: '🚗', title: 'Road Accident', color: 'bg-red-50 hover:bg-red-100', link: '/report' },
    { icon: '🔥', title: 'Fire', color: 'bg-orange-50 hover:bg-orange-100', link: '/report' },
    { icon: '🚨', title: 'Crime', color: 'bg-purple-50 hover:bg-purple-100', link: '/report' },
    { icon: '🩺', title: 'Medical', color: 'bg-blue-50 hover:bg-blue-100', link: '/report' },
  ];

  // ✅ Plus Shape SOS Options
  const sosOptions = [
    { 
      id: 'up', 
      label: '🔥 Fire', 
      // icon: '🔥',
      textColor: 'text-orange-600',
      emergencyType: 'Fire', 
      x: 0, 
      y: -95,
      arrow: '↑',
      defaultDescription: 'Fire reported at location'
    },
    { 
      id: 'right', 
      label: '🚗 Accident', 
      // icon: '🚗',
      textColor: 'text-red-600',
      emergencyType: 'Accident', 
      x: 95, 
      y: 0,
      arrow: '→',
      defaultDescription: 'Road accident reported at location'
    },
    { 
      id: 'down', 
      label: '🩺 Medical', 
      // icon: '🩺',
      textColor: 'text-green-600',
      emergencyType: 'Medical', 
      x: 0, 
      y: 95,
      arrow: '↓',
      defaultDescription: 'Medical emergency reported at location'
    },
    { 
      id: 'left', 
      label: '🚨 Crime', 
      // icon: '🚨',
      textColor: 'text-purple-600',
      emergencyType: 'Crime', 
      x: -95, 
      y: 0,
      arrow: '←',
      defaultDescription: 'Crime reported at location'
    },
  ];

  // ✅ SOS Button Handlers - FIXED
  const handlePointerDown = (e) => {
    e.preventDefault();
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    
    setIsHolding(true);
    setHoldProgress(0);
    setDirection(null);
    startXRef.current = clientX;
    startYRef.current = clientY;
    
    holdTimerRef.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdTimerRef.current);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    clearInterval(holdTimerRef.current);
    setIsHolding(false);
    
    if (holdProgress >= 100 && direction) {
      // Show description modal
      const selected = sosOptions.find(opt => opt.id === direction);
      if (selected) {
        setSelectedEmergency(selected);
        setDescription(selected.defaultDescription || '');
        setShowDescriptionModal(true);
        setDirection(null);
        setHoldProgress(0);
      }
    } else {
      setDirection(null);
      setHoldProgress(0);
      // If hold was less than 100%, navigate to report page
      if (holdProgress < 100 && holdProgress > 10) {
        navigate('/report');
      }
    }
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    if (!isHolding || holdProgress < 100) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    
    const deltaX = clientX - startXRef.current;
    const deltaY = clientY - startYRef.current;
    
    const threshold = 30;
    
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      let selectedDirection = null;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        selectedDirection = deltaX > 0 ? 'right' : 'left';
      } else {
        selectedDirection = deltaY < 0 ? 'up' : 'down';
      }
      
      setDirection(selectedDirection);
    } else {
      setDirection(null);
    }
  };

  // ✅ Handle touch events
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      handlePointerDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handlePointerUp({ preventDefault: () => {} });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      handlePointerMove({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
    }
  };

  // ✅ Submit SOS Emergency with Description
  const handleSOSSubmit = async (emergencyType, icon, customDescription) => {
    if (loading) return;
    setLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const emergencyData = {
        name: userData.fullName || userData.name || 'Anonymous',
        phone: userData.phone || 'N/A',
        emergencyType: emergencyType,
        description: customDescription || `${emergencyType} reported via SOS gesture`,
        latitude: location.latitude,
        longitude: location.longitude,
        priority: 'High',
        reportType: 'citizen',
        reporterRole: 'citizen'
      };
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/emergencies/citizen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${icon} Emergency reported!\nType: ${emergencyType}\nComplaint ID: ${result.complaintId}\n\n📍 Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
        navigate(`/track/${result.complaintId}`);
      } else {
        throw new Error(result.message || 'Failed to report emergency');
      }
    } catch (error) {
      console.error('Error reporting emergency:', error);
      alert('❌ Failed to report emergency. Please try again.\n\n' + error.message);
    } finally {
      setLoading(false);
      setShowDescriptionModal(false);
      setSelectedEmergency(null);
      setDescription('');
    }
  };

  const getSelectedEmergency = () => {
    if (!direction) return null;
    return sosOptions.find(opt => opt.id === direction);
  };

  const selected = getSelectedEmergency();

  // ✅ Description Modal
  const DescriptionModal = () => {
    if (!showDescriptionModal || !selectedEmergency) return null;

    const getEmergencyEmoji = () => {
      const emojis = {
        'Fire': '🔥',
        'Accident': '🚗',
        'Medical': '🩺',
        'Crime': '🚨'
      };
      return emojis[selectedEmergency.emergencyType] || '🆘';
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {}}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <div className="text-center mb-4">
              <span className="text-5xl block mb-2">{getEmergencyEmoji()}</span>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedEmergency.emergencyType} Emergency
              </h2>
              <p className="text-gray-600 text-sm">Add details about the emergency (optional)</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📍 Location
                </label>
                <div className="bg-gray-50 rounded-lg p-2 text-sm text-gray-600">
                  <span className="font-medium">Lat:</span> {location.latitude.toFixed(6)}
                  <span className="ml-3 font-medium">Lng:</span> {location.longitude.toFixed(6)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📝 Description <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  placeholder="Describe what happened (optional)..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  💡 You can leave this blank or add more details
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDescriptionModal(false);
                    setSelectedEmergency(null);
                    setDescription('');
                    setDirection(null);
                    setHoldProgress(0);
                  }}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSOSSubmit(
                    selectedEmergency.emergencyType,
                    selectedEmergency.icon,
                    description || selectedEmergency.defaultDescription || `${selectedEmergency.emergencyType} reported at location`
                  )}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      🚨 Report {selectedEmergency.emergencyType}
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                🆘 This will send an alert to Police, Hospitals, and Fire Brigade
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* User Greeting */}
        {user && (
          <div className="text-center mb-4">
            <p className="text-gray-600 text-base">
              Welcome back, <span className="font-semibold text-blue-600">{user.fullName || user.name || 'User'}</span> 👋
            </p>
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            🚨 Emergency Response System
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Quick, efficient emergency reporting
          </p>
        </div>

        {/* ✅ Plus Shape SOS - FIXED */}
        <div className="flex justify-center my-8">
          <div 
            ref={sosContainerRef}
            className="relative w-64 h-64 md:w-72 md:h-72 select-none touch-none"
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseMove={handlePointerMove}
            onMouseLeave={() => {
              if (isHolding) {
                clearInterval(holdTimerRef.current);
                setIsHolding(false);
                setDirection(null);
                setHoldProgress(0);
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onTouchCancel={() => {
              clearInterval(holdTimerRef.current);
              setIsHolding(false);
              setDirection(null);
              setHoldProgress(0);
            }}
            style={{ touchAction: 'none' }}
          >
            {/* ✅ Direction Arrows with Labels */}
            {sosOptions.map((option) => (
              <div
                key={option.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none ${
                  direction === option.id 
                    ? `scale-110 ${option.textColor} font-bold` 
                    : 'text-gray-500'
                }`}
                style={{
                  left: `calc(50% + ${option.x}px)`,
                  top: `calc(50% + ${option.y}px)`,
                }}
              >
                <div className="flex flex-col items-center">
                  {/* Arrow Icon */}
                  <div className={`text-3xl font-bold ${direction === option.id ? option.textColor : 'text-gray-400'}`}>
                    {option.arrow}
                  </div>
                  {/* Icon */}
                  <div className="text-2xl">{option.icon}</div>
                  {/* Label */}
                  <div className={`text-[10px] font-medium whitespace-nowrap ${direction === option.id ? option.textColor : 'text-gray-500'}`}>
                    {option.label}
                  </div>
                </div>
              </div>
            ))}

            {/* Progress Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  className="text-gray-200"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
                <circle
                  className="text-red-600 transition-all duration-300"
                  strokeWidth="4"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * holdProgress) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
              </svg>
            </div>
            
            {/* Center SOS Button */}
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-700 text-white text-2xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all z-10 cursor-pointer flex items-center justify-center ${
                isHolding ? 'scale-95' : 'hover:scale-105'
              } ${selected && direction ? 'ring-4 ring-offset-4 ring-' + (direction === 'up' ? 'orange' : direction === 'right' ? 'red' : direction === 'down' ? 'green' : 'purple') + '-400' : ''}`}
            >
              <span className="flex flex-col items-center">
                <span>🆘</span>
                <span className="text-[8px] mt-0.5">
                  {loading ? 'Sending...' : isHolding ? `${Math.round(holdProgress)}%` : 'Hold 5s'}
                </span>
              </span>
            </div>

            {/* Direction Guide Text */}
            {/* {!isHolding && !selected && !showDescriptionModal && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
                <p className="text-xs text-gray-400">⬆️ ⬇️ ⬅️ ➡️  Swipe to report</p>
              </div>
            )} */}

            {/* Selected Direction Indicator */}
            {selected && direction && !showDescriptionModal && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow-lg border-2 border-blue-500 animate-bounce whitespace-nowrap pointer-events-none">
                <span className="text-xs font-semibold">
                  {selected.icon} {selected.label} → Release to add description
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Description Modal */}
        <DescriptionModal />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} p-3 rounded-xl text-center hover:shadow-md transform hover:scale-105 transition-all border border-gray-100`}
            >
              <div className="text-2xl mb-0.5">{action.icon}</div>
              <div className="font-medium text-gray-700 text-[10px]">{action.title}</div>
            </Link>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-semibold text-lg">Easy Reporting</h3>
            <p className="text-gray-600 text-sm">Report emergencies with just a few taps</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-3">📍</div>
            <h3 className="font-semibold text-lg">Live Tracking</h3>
            <p className="text-gray-600 text-sm">Track your complaint status in real-time</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-3">🚨</div>
            <h3 className="font-semibold text-lg">Quick Response</h3>
            <p className="text-gray-600 text-sm">Emergency services dispatched immediately</p>
          </div>
        </div>

        {/* CTA for non-logged in users */}
        {!user && (
          <div className="mt-12 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg mx-auto">
              <p className="text-gray-700 text-sm mb-2">
                🔐 Register for faster emergency response
              </p>
              <Link
                to="/register"
                className="inline-block px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                Register Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;