import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Default location (Ongole, Andhra Pradesh)
const DEFAULT_LOCATION = { latitude: 15.5057, longitude: 80.0499 };

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [direction, setDirection] = useState(null);
  const holdTimerRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationAttempted, setLocationAttempted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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

  // ✅ Plus Shape Arrow Options
  const sosOptions = [
    { 
      id: 'up', 
      label: '🔥 Fire', 
      // icon: '🔥', 
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-500',
      emergencyType: 'Fire', 
      x: 0, 
      y: -95,
      arrow: '↑'
    },
    { 
      id: 'right', 
      label: '🚗 Accident', 
      // icon: '🚗', 
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-red-600',
      borderColor: 'border-red-500',
      emergencyType: 'Accident', 
      x: 95, 
      y: 0,
      arrow: '→'
    },
    { 
      id: 'down', 
      label: '🩺 Medical', 
      // icon: '🩺', 
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-600',
      borderColor: 'border-green-500',
      emergencyType: 'Medical', 
      x: 0, 
      y: 95,
      arrow: '↓'
    },
    { 
      id: 'left', 
      label: '🚨 Crime', 
      // icon: '🚨', 
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-500',
      emergencyType: 'Crime', 
      x: -95, 
      y: 0,
      arrow: '←'
    },
  ];

  const handleMouseDown = (e) => {
    setIsHolding(true);
    setHoldProgress(0);
    setDirection(null);
    startXRef.current = e.clientX || e.touches?.[0]?.clientX || 0;
    startYRef.current = e.clientY || e.touches?.[0]?.clientY || 0;
    
    holdTimerRef.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdTimerRef.current);
          setIsHolding(false);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleMouseUp = () => {
    clearInterval(holdTimerRef.current);
    setIsHolding(false);
    setDirection(null);
    
    if (holdProgress < 100) {
      navigate('/report');
    }
  };

  const handleMouseMove = (e) => {
    if (!isHolding || holdProgress < 100) return;
    
    const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
    const currentY = e.clientY || e.touches?.[0]?.clientY || 0;
    
    const deltaX = currentX - startXRef.current;
    const deltaY = currentY - startYRef.current;
    
    const threshold = 25;
    
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

  const handleSOSSubmit = async (emergencyType, icon) => {
    if (loading) return;
    setLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const emergencyData = {
        name: userData.fullName || userData.name || 'Anonymous',
        phone: userData.phone || 'N/A',
        emergencyType: emergencyType,
        description: `Emergency reported via SOS gesture (${emergencyType})`,
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
        alert(`✅ ${icon} Emergency reported!\nType: ${emergencyType}\nComplaint ID: ${result.complaintId}`);
        navigate(`/track/${result.complaintId}`);
      } else {
        throw new Error(result.message || 'Failed to report emergency');
      }
    } catch (error) {
      console.error('Error reporting emergency:', error);
      alert('❌ Failed to report emergency. Please try again.\n\n' + error.message);
    } finally {
      setLoading(false);
      setDirection(null);
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

        {/* ✅ Plus Shape SOS with Arrows */}
        <div className="flex justify-center my-8">
          <div 
            className="relative w-64 h-64 md:w-72 md:h-72"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleMouseMove}
            style={{ touchAction: 'none' }}
          >
            {/* ✅ Direction Arrows with Labels */}
            {sosOptions.map((option) => (
              <div
                key={option.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer ${
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
            <div className="absolute inset-0 flex items-center justify-center">
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
            <button
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-700 text-white text-2xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all z-10 ${
                isHolding ? 'scale-95' : ''
              } ${selected && direction ? 'ring-4 ring-offset-4 ring-' + (direction === 'up' ? 'orange' : direction === 'right' ? 'red' : direction === 'down' ? 'green' : 'purple') + '-400' : ''}`}
              disabled={loading}
            >
              <span className="flex flex-col items-center">
                <span>🆘</span>
                <span className="text-[8px] mt-0.5">
                  {loading ? 'Sending...' : isHolding ? `${Math.round(holdProgress)}%` : 'Hold 5s'}
                </span>
              </span>
            </button>

            {/* Direction Guide Text */}
            {/* {!isHolding && !selected && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                <p className="text-xs text-gray-400">⬆️ ⬇️ ⬅️ ➡️  Swipe to report</p>
              </div>
            )} */}

            {/* Selected Direction Indicator */}
            {selected && direction && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow-lg border-2 border-blue-500 animate-bounce whitespace-nowrap">
                <span className="text-xs font-semibold">
                  {selected.icon} {selected.label} → Release to report!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
          {[
            { icon: '🚗', title: 'Road Accident', color: 'bg-red-50 hover:bg-red-100', link: '/report' },
            { icon: '🔥', title: 'Fire', color: 'bg-orange-50 hover:bg-orange-100', link: '/report' },
            { icon: '🚨', title: 'Crime', color: 'bg-purple-50 hover:bg-purple-100', link: '/report' },
            { icon: '🩺', title: 'Medical', color: 'bg-blue-50 hover:bg-blue-100', link: '/report' },
          ].map((action, index) => (
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

        {/* Registration CTA */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 max-w-2xl mx-auto text-center">
            <p className="text-gray-700 text-sm mb-1">
              🔐 One-time registration for faster emergency response
            </p>
            <Link
              to="/register"
              className="inline-block px-5 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              Register Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;