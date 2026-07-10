import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'citizen',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('user');
    if (isLoggedIn === 'true' && user) {
      const parsed = JSON.parse(user);
      if (parsed.role === 'police') navigate('/police');
      else if (parsed.role === 'dispatcher') navigate('/dispatcher');
      else navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userData = null;
      let redirectPath = '/';
      let role = 'citizen';
      
      if (formData.email === 'dispatcher@system.com' && formData.password === 'password') {
        role = 'dispatcher';
        userData = { 
          email: formData.email, 
          name: 'Dispatcher', 
          role: 'dispatcher',
          fullName: 'System Dispatcher',
          phone: '9999999999',
          bloodGroup: 'O+',
          avatar: '🖥️'
        };
        redirectPath = '/dispatcher';
      } else if (formData.email === 'police@system.com' && formData.password === 'password') {
        role = 'police';
        userData = { 
          email: formData.email, 
          name: 'Police Officer', 
          role: 'police',
          fullName: 'Police Officer',
          phone: '8888888888',
          bloodGroup: 'B+',
          badgeNumber: 'POL-001',
          avatar: '👮'
        };
        redirectPath = '/police';
      } else {
        role = 'citizen';
        userData = { 
          email: formData.email, 
          name: formData.email.split('@')[0], 
          role: 'citizen',
          fullName: formData.email.split('@')[0],
          phone: '9876543210',
          bloodGroup: 'A+',
          avatar: '👤'
        };
        redirectPath = '/';
      }

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('authToken', 'demo-token-' + Date.now());
      
      setLoading(false);
      navigate(redirectPath);
    } catch (err) {
      setError('Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Decorative Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white rounded-full"></div>
          </div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">🚨</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              {isLogin ? 'Sign in to access your dashboard' : 'Join our emergency response system'}
            </p>
          </div>
        </div>

        {/* Form Area */}
        <div className="px-6 py-8">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <FaUser className="inline mr-2 text-blue-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <FaEnvelope className="inline mr-2 text-blue-500" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <FaLock className="inline mr-2 text-blue-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="citizen">👤 Citizen</option>
                  <option value="dispatcher">🖥️ Dispatcher</option>
                  <option value="police">👮 Police Officer</option>
                </select>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-3 gap-3">
            <button className="py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 text-gray-700 text-sm">
              <span className="text-red-500 text-lg">G</span> Google
            </button>
            <button className="py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 text-gray-700 text-sm">
              <span className="text-blue-600 text-lg">f</span> Facebook
            </button>
            <button className="py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 text-gray-700 text-sm">
              <span className="text-blue-400 text-lg">𝕏</span> Twitter
            </button>
          </div>

          {/* Toggle Login/Signup */}
          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-600 hover:text-blue-600 font-medium transition"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-blue-600">Sign up free</span></>
              ) : (
                <>Already have an account? <span className="text-blue-600">Sign in</span></>
              )}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 text-center font-medium mb-2">🔑 Demo Credentials</p>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>👮 Police</span>
                <span className="text-blue-600">police@system.com / password</span>
              </div>
              <div className="flex justify-between">
                <span>🖥️ Dispatcher</span>
                <span className="text-blue-600">dispatcher@system.com / password</span>
              </div>
              <div className="flex justify-between">
                <span>👤 Citizen</span>
                <span className="text-blue-600">any@email.com / password</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;