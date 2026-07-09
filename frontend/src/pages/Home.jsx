import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Default location (Ongole, Andhra Pradesh)
const DEFAULT_LOCATION = { latitude: 15.5057, longitude: 80.0499 };

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationAttempted, setLocationAttempted] = useState(false);

  // Auto-login check
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Get user location with fallback - only once
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
            // Keep default location
          }
        );
      }
    }
  }, [locationAttempted]);

  // Handle SOS Button Hold
  const handleMouseDown = (e) => {
    setIsHolding(true);
    setHoldProgress(0);
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
    
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      let emergencyType = '';
      let icon = '';
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          emergencyType = 'General Emergency';
          icon = '🆘';
        } else {
          emergencyType = 'Crime/Road Accident';
          icon = '🚨';
        }
      } else {
        if (deltaY < 0) {
          emergencyType = 'Medical Emergency';
          icon = '🩺';
        } else {
          emergencyType = 'Fire Emergency';
          icon = '🔥';
        }
      }
      
      handleEmergencySubmit(emergencyType, icon);
    }
  };

  const handleEmergencySubmit = async (emergencyType, icon) => {
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
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/emergencies/citizen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(`✅ ${icon} Emergency reported!\nType: ${emergencyType}\nComplaint ID: ${result.complaintId}`);
      navigate(`/track/${result.complaintId}`);
    } catch (error) {
      console.error('Error reporting emergency:', error);
      alert('Failed to report emergency. Please try again.');
    }
  };

  const quickActions = [
    { icon: '🚗', title: 'Road Accident', color: 'bg-red-100', link: '/report' },
    { icon: '🔥', title: 'Fire', color: 'bg-orange-100', link: '/report' },
    { icon: '🚨', title: 'Crime', color: 'bg-purple-100', link: '/report' },
    { icon: '🩺', title: 'Medical', color: 'bg-blue-100', link: '/report' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user && (
          <div className="text-center mb-4">
            <p className="text-gray-600">Welcome back, <span className="font-semibold">{user.fullName || user.name || 'User'}</span> 👋</p>
          </div>
        )}

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🚨 Emergency Response System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quick, efficient emergency reporting
          </p>
        </div>

        {/* SOS Button */}
        <div className="flex justify-center my-12">
          <div 
            className="relative"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleMouseMove}
            style={{ touchAction: 'none' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
                <circle
                  className="text-red-600 transition-all duration-300"
                  strokeWidth="8"
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
            
            <button
              className={`w-32 h-32 md:w-40 md:h-40 bg-red-600 text-white text-3xl font-bold rounded-full shadow-lg hover:bg-red-700 transform hover:scale-105 transition-all relative z-10 ${
                isHolding ? 'scale-95' : ''
              }`}
            >
              <span className="flex flex-col items-center">
                <span>🆘</span>
                <span className="text-xs mt-1">
                  {isHolding ? `${Math.round(holdProgress)}%` : 'Hold 5s'}
                </span>
              </span>
            </button>
            
            {isHolding && holdProgress >= 100 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute -top-16 text-green-600 font-bold text-sm animate-bounce">
                  👆 Up = Medical
                </div>
                <div className="absolute -bottom-16 text-orange-600 font-bold text-sm animate-bounce">
                  👇 Down = Fire
                </div>
                <div className="absolute -left-24 text-purple-600 font-bold text-sm animate-bounce">
                  👈 Left = Crime
                </div>
                <div className="absolute -right-24 text-blue-600 font-bold text-sm animate-bounce">
                  👉 Right = General
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} p-6 rounded-xl text-center hover:shadow-lg transform hover:scale-105 transition-all`}
            >
              <div className="text-4xl mb-2">{action.icon}</div>
              <div className="font-medium text-gray-800">{action.title}</div>
            </Link>
          ))}
        </div>

        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto text-center">
            <p className="text-gray-700 mb-4">
              🔐 One-time registration for faster emergency response
            </p>
            <Link
              to="/register"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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