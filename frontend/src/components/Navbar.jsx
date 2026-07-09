import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('citizen');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Check login status on mount and storage changes
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    const loggedIn = localStorage.getItem('isLoggedIn');
    
    if (token && userData && loggedIn === 'true') {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setUserRole(parsed.role || 'citizen');
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setUserRole('citizen');
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    setUser(null);
    setUserRole('citizen');
    setIsLoggedIn(false);
    setDropdownOpen(false);
    navigate('/login');
  };

  // Determine which navbar to show
  const getNavItems = () => {
    if (!isLoggedIn) {
      return { items: [], title: 'Emergency Response', icon: '🚨' };
    }
    
    if (userRole === 'police') {
      return {
        items: [
          { name: '📊 Dashboard', path: '/police', icon: '📊' },
          { name: '📍 Live Map', path: '/police', icon: '📍' },
          { name: '📋 Reports', path: '/police', icon: '📋' },
          { name: '👮 My Cases', path: '/police', icon: '👮' },
        ],
        title: 'Police Dashboard',
        icon: '👮',
        color: 'from-blue-600 to-blue-800'
      };
    }
    
    if (userRole === 'dispatcher') {
      return {
        items: [
          { name: '📊 Dashboard', path: '/dispatcher', icon: '📊' },
          { name: '📍 Live Map', path: '/dispatcher', icon: '📍' },
          { name: '📋 Reports', path: '/dispatcher', icon: '📋' },
          { name: '👮 Assign', path: '/dispatcher', icon: '👮' },
        ],
        title: 'Dispatch Center',
        icon: '🖥️',
        color: 'from-purple-600 to-purple-800'
      };
    }
    
    // Citizen
    return {
      items: [
        { name: '🏠 Home', path: '/', icon: '🏠' },
        { name: '🚨 Report', path: '/report', icon: '🚨' },
        { name: '📋 Track', path: '/track', icon: '📋' },
      ],
      title: 'Emergency Response',
      icon: '🚨',
      color: 'from-red-600 to-red-700'
    };
  };

  const navConfig = getNavItems();
  const isActive = (path) => location.pathname === path;

  const getUserInitial = () => {
    const name = user?.fullName || user?.name || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getRoleIcon = () => {
    if (userRole === 'police') return '👮';
    if (userRole === 'dispatcher') return '🖥️';
    return '👤';
  };

  const getRoleColor = () => {
    if (userRole === 'police') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (userRole === 'dispatcher') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  // If not logged in, show simple public navbar
  if (!isLoggedIn) {
    return (
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl">🚨</span>
                <span className="text-xl font-bold text-gray-800 hidden sm:block">
                  Emergency Response
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Logged in - show role-based navbar
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to={navConfig.items[0]?.path || '/'} 
              className="flex items-center space-x-2 hover:opacity-80 transition"
            >
              <span className="text-2xl">{navConfig.icon}</span>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">
                {navConfig.title}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navConfig.items.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRoleColor()}`}>
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
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${getRoleColor()}`}>
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
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor()}`}>
                        {getRoleIcon()} {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {navConfig.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`block px-4 py-2 text-sm hover:bg-gray-50 transition ${
                          isActive(item.path) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                        }`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Logout */}
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
            {/* User Info in Mobile */}
            <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-100">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${getRoleColor()}`}>
                {getUserInitial()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {user?.fullName || user?.name || 'User'}
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor()}`}>
                  {getRoleIcon()} {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </span>
              </div>
            </div>

            {navConfig.items.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
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

export default Navbar;