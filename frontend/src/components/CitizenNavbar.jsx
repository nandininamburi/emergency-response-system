import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const CitizenNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('citizen');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setUserRole(parsed.role || 'citizen');
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

  // Citizen nav items
  const citizenNavItems = [
    { name: '🏠 Home', path: '/' },
    { name: '🚨 Report', path: '/report' },
    { name: '📋 Track', path: '/track' },
  ];

  // Dispatcher nav items
  const dispatcherNavItems = [
    { name: '📊 Dashboard', path: '/dispatcher' },
    { name: '📍 Live Map', path: '/dispatcher' },
    { name: '📋 Reports', path: '/dispatcher' },
    { name: '👮 Assign', path: '/dispatcher' },
    { name: '🆘 SOS', path: '/sos' },
  ];

  const navItems = userRole === 'dispatcher' ? dispatcherNavItems : citizenNavItems;
  const isDispatcher = userRole === 'dispatcher';

  const getUserInitial = () => {
    const name = user?.fullName || user?.name || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getRoleBadge = () => {
    if (userRole === 'dispatcher') {
      return { icon: '🖥️', label: 'Dispatcher', color: 'bg-purple-100 text-purple-800' };
    }
    return { icon: '👤', label: 'Citizen', color: 'bg-green-100 text-green-800' };
  };

  const roleBadge = getRoleBadge();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={isDispatcher ? '/dispatcher' : '/'} className="flex items-center space-x-2">
              <span className="text-2xl">🚨</span>
              <div>
                <span className="text-xl font-bold text-gray-800">
                  {isDispatcher ? 'Dispatch Center' : 'Emergency Response'}
                </span>
                <span className="block text-xs text-gray-500">
                  {isDispatcher ? 'Managing Emergencies' : 'Help & Support'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? isDispatcher ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* User Profile */}
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${roleBadge.color}`}>
                  {getUserInitial()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:block">
                  {user?.fullName || user?.name || 'User'}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${roleBadge.color}`}>
                        {getUserInitial()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {user?.fullName || user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email || ''}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
                        {roleBadge.icon} {roleBadge.label}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {navItems.map((item) => (
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-100">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${roleBadge.color}`}>
                {getUserInitial()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {user?.fullName || user?.name || 'User'}
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}>
                  {roleBadge.icon} {roleBadge.label}
                </span>
              </div>
            </div>

            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
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
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default CitizenNavbar;