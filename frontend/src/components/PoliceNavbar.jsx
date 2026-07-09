import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const PoliceNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // ✅ Removed Live Map from navbar
  const policeNavItems = [
    { name: '📊 Dashboard', path: '/police' },
    { name: '📋 All Reports', path: '/police/reports' },
    { name: '👮 My Cases', path: '/police/cases' },
    { name: '🆘 SOS Alerts', path: '/police/sos' },
  ];

  const getUserInitial = () => {
    const name = user?.fullName || user?.name || 'P';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg sticky top-0 z-50 border-b-2 border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/police" className="flex items-center space-x-3">
              <div className="bg-yellow-400 p-2 rounded-full">
                <span className="text-2xl">👮</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">Police Dashboard</span>
                <span className="block text-xs text-yellow-300">Emergency Response System</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {policeNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-yellow-400 text-blue-900'
                    : 'text-white hover:bg-blue-700 hover:text-yellow-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-blue-900">
                  {getUserInitial()}
                </div>
                <span className="text-sm font-medium text-white hidden lg:block">
                  {user?.fullName || user?.name || 'Officer'}
                </span>
                <svg className={`w-4 h-4 text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-800">
                        {getUserInitial()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {user?.fullName || user?.name || 'Officer'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email || 'police@system.com'}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        👮 Police
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {policeNavItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition text-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center space-x-2"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-blue-700 transition text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-blue-900">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <div className="flex items-center space-x-3 px-3 py-3 border-b border-blue-700">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-lg font-bold text-blue-900">
                {getUserInitial()}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">
                  {user?.fullName || user?.name || 'Officer'}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-400 text-blue-900">
                  👮 Police
                </span>
              </div>
            </div>

            {policeNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-900 hover:text-red-200 transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PoliceNavbar;