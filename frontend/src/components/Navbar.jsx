import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('citizen');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuthStatus = () => {
    const userData = localStorage.getItem('user');
    const loggedIn = localStorage.getItem('isLoggedIn');
    
    if (loggedIn === 'true' && userData) {
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
    localStorage.removeItem('authToken');
    setUser(null);
    setIsLoggedIn(false);
    setDropdownOpen(false);
    navigate('/login');
  };

  const getNavItems = () => {
    if (!isLoggedIn) {
      return { items: [], title: 'Emergency Response', icon: '🚨' };
    }
    
    if (userRole === 'police') {
      return {
        items: [
          { name: '📊 Dashboard', path: '/police' },
          { name: '📋 Reports', path: '/police/reports' },
          { name: '🆘 SOS', path: '/police/sos' },
        ],
        title: 'Police Dashboard',
        icon: '👮'
      };
    }
    
    if (userRole === 'dispatcher') {
      return {
        items: [
          { name: '📊 Dashboard', path: '/dispatcher' },
          { name: '🆘 SOS', path: '/sos' },
        ],
        title: 'Dispatch Center',
        icon: '🖥️'
      };
    }
    
    return {
      items: [
        { name: '🏠 Home', path: '/' },
        { name: '🚨 Report', path: '/report' },
        { name: '📋 Track', path: '/track' },
      ],
      title: 'Emergency Response',
      icon: '🚨'
    };
  };

  const navConfig = getNavItems();
  const isActive = (path) => location.pathname === path;

  const getUserInitial = () => {
    const name = user?.fullName || user?.name || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getRoleBadge = () => {
    if (userRole === 'police') return { icon: '👮', label: 'Police', color: 'bg-blue-100 text-blue-800' };
    if (userRole === 'dispatcher') return { icon: '🖥️', label: 'Dispatcher', color: 'bg-purple-100 text-purple-800' };
    return { icon: '👤', label: 'Citizen', color: 'bg-green-100 text-green-800' };
  };

  const roleBadge = getRoleBadge();

  // Public navbar
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
              <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Logged in navbar
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={navConfig.items[0]?.path || '/'} className="flex items-center space-x-2">
              <span className="text-2xl">{navConfig.icon}</span>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">
                {navConfig.title}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navConfig.items.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(item.path) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="relative ml-4">
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
                <svg className={`w-4 h-4 text-gray-400 transition ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

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
                    {navConfig.items.map((item) => (
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
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {dropdownOpen && (
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

            {navConfig.items.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setDropdownOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <button
              onClick={() => {
                handleLogout();
                setDropdownOpen(false);
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