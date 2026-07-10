import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [direction, setDirection] = useState(null);
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
      textColor: 'text-orange-600',
      emergencyType: 'Fire', 
      x: 0, 
      y: -95,
      arrow: '↑',
      icon: '🔥'
    },
    { 
      id: 'right', 
      label: '🚗 Accident', 
      textColor: 'text-red-600',
      emergencyType: 'Accident', 
      x: 95, 
      y: 0,
      arrow: '→',
      icon: '🚗'
    },
    { 
      id: 'down', 
      label: '🩺 Medical', 
      textColor: 'text-green-600',
      emergencyType: 'Medical', 
      x: 0, 
      y: 95,
      arrow: '↓',
      icon: '🩺'
    },
    { 
      id: 'left', 
      label: '🚨 Crime', 
      textColor: 'text-purple-600',
      emergencyType: 'Crime', 
      x: -95, 
      y: 0,
      arrow: '←',
      icon: '🚨'
    },
  ];

  // ✅ SOS Button Handlers
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
    
    // ✅ If hold completed and direction selected -> AUTO SEND
    if (holdProgress >= 100 && direction) {
      const selected = sosOptions.find(opt => opt.id === direction);
      if (selected) {
        // Auto send immediately - NO MODAL
        handleAutoSOSSubmit(selected);
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

  // ✅ AUTO SEND SOS - No Modal, No Confirmation
  const handleAutoSOSSubmit = async (selected) => {
    if (loading) return;
    setLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const emergencyData = {
        name: userData.fullName || userData.name || 'Anonymous',
        phone: userData.phone || 'N/A',
        emergencyType: selected.emergencyType,
        description: `${selected.emergencyType} reported via SOS gesture`,
        latitude: location.latitude,
        longitude: location.longitude,
        priority: 'High',
        reportType: 'citizen',
        reporterRole: 'citizen'
      };
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://emergency-backend-uzkq.onrender.com/api';
      
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
        // ✅ Show simple success alert and navigate
        alert(`✅ ${selected.emergencyType} Emergency Reported!\nComplaint ID: ${result.complaintId}\n\n📍 Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
        navigate(`/track/${result.complaintId}`);
      } else {
        throw new Error(result.message || 'Failed to report emergency');
      }
    } catch (error) {
      console.error('Error reporting emergency:', error);
      alert(`❌ Failed to report ${selected.emergencyType} emergency.\n\nPlease try again or use the report form.`);
    } finally {
      setLoading(false);
      setDirection(null);
      setHoldProgress(0);
    }
  };

  const getSelectedEmergency = () => {
    if (!direction) return null;
    return sosOptions.find(opt => opt.id === direction);
  };

  const selected = getSelectedEmergency();

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

        {/* ✅ Plus Shape SOS - Auto Send */}
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

            {/* Selected Direction Indicator - Shows which emergency is selected */}
            {selected && direction && !loading && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow-lg border-2 border-blue-500 animate-bounce whitespace-nowrap pointer-events-none">
                <span className="text-xs font-semibold">
                  {selected.icon} {selected.label} → Release to report instantly!
                </span>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-100 px-4 py-1.5 rounded-full shadow-lg border-2 border-red-500 whitespace-nowrap pointer-events-none">
                <span className="text-xs font-semibold text-red-600 animate-pulse">
                  ⏳ Sending emergency...
                </span>
              </div>
            )}
          </div>
        </div>

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