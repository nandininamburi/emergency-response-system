import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const quickActions = [
    { icon: '🚗', title: 'Road Accident', color: 'bg-red-50 hover:bg-red-100', link: '/report' },
    { icon: '🔥', title: 'Fire', color: 'bg-orange-50 hover:bg-orange-100', link: '/report' },
    { icon: '🚨', title: 'Crime', color: 'bg-purple-50 hover:bg-purple-100', link: '/report' },
    { icon: '🩺', title: 'Medical', color: 'bg-blue-50 hover:bg-blue-100', link: '/report' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🚨 Emergency Response System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quick, efficient emergency reporting and response coordination
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Welcome back, <span className="font-semibold text-blue-600">{user.fullName || user.name}</span> 👋
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} p-4 rounded-xl text-center hover:shadow-md transform hover:scale-105 transition border border-gray-100`}
            >
              <div className="text-3xl mb-1">{action.icon}</div>
              <div className="font-medium text-gray-700 text-sm">{action.title}</div>
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