import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('police@system.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Determine role based on email
      let role = 'citizen';
      let fullName = email.split('@')[0];
      
      if (email.includes('dispatcher')) {
        role = 'dispatcher';
        fullName = 'System Dispatcher';
      } else if (email.includes('police')) {
        role = 'police';
        fullName = 'Police Officer';
      }

      const userData = {
        uid: 'demo-' + Date.now(),
        email: email,
        name: fullName,
        fullName: fullName,
        role: role,
        phone: role === 'dispatcher' ? '9999999999' : '9876543210',
        bloodGroup: 'O+',
        isDemo: true
      };

      // Use AuthContext login
      login(userData);
      
      // Redirect based on role
      if (role === 'police') {
        navigate('/police');
      } else if (role === 'dispatcher') {
        navigate('/dispatcher');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick login handlers
  const quickLogin = (role) => {
    const credentials = {
      police: { email: 'police@system.com', password: 'password' },
      dispatcher: { email: 'dispatcher@system.com', password: 'password' },
      citizen: { email: 'citizen@system.com', password: 'password' }
    };
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🚨</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
          <p className="text-blue-100 text-sm">Sign in to access your dashboard</p>
        </div>

        <div className="px-6 py-8">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>

          {/* ✅ Quick Login Buttons */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 text-center mb-2">🔑 Quick Login (Click to auto-fill)</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => quickLogin('police')}
                className="py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium text-blue-700 transition flex items-center justify-center gap-1"
              >
                👮 Police
              </button>
              <button
                onClick={() => quickLogin('dispatcher')}
                className="py-2 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-medium text-purple-700 transition flex items-center justify-center gap-1"
              >
                🖥️ Dispatcher
              </button>
              <button
                onClick={() => quickLogin('citizen')}
                className="py-2 px-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-medium text-green-700 transition flex items-center justify-center gap-1"
              >
                👤 Citizen
              </button>
            </div>
          </div>

          <div className="text-center mt-4">
            <Link to="/register" className="text-sm text-gray-600 hover:text-blue-600">
              Don't have an account? <span className="font-medium text-blue-600">Sign up</span>
            </Link>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 text-center font-medium">🔑 Default Login Credentials</p>
            <div className="text-xs text-gray-600 mt-1 space-y-1">
              <div className="flex justify-between">
                <span>👮 Police</span>
                <span className="text-blue-600 font-medium">police@system.com / password</span>
              </div>
              <div className="flex justify-between">
                <span>🖥️ Dispatcher</span>
                <span className="text-purple-600 font-medium">dispatcher@system.com / password</span>
              </div>
              <div className="flex justify-between">
                <span>👤 Citizen</span>
                <span className="text-green-600 font-medium">citizen@system.com / password</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;