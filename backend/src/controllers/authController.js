const { auth } = require('../config/firebase');

// ✅ Helper to generate demo user
const generateDemoUser = (email, role = 'citizen') => {
  return {
    uid: 'demo-' + Date.now(),
    email: email || 'demo@system.com',
    name: (email || 'demo').split('@')[0],
    role: role,
    phone: '',
    bloodGroup: '',
    isDemo: true
  };
};

// ✅ Register
exports.register = async (req, res) => {
  try {
    console.log('📝 Registration request:', req.body.email);
    
    const { email, password, fullName, phone, bloodGroup, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }
    
    // Demo mode - always works
    const demoUser = generateDemoUser(email, role || 'citizen');
    demoUser.fullName = fullName || demoUser.name;
    demoUser.phone = phone || '';
    demoUser.bloodGroup = bloodGroup || '';
    
    return res.status(201).json({
      success: true,
      ...demoUser,
      message: 'Registration successful!'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login request:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
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
    
    const demoUser = {
      uid: 'demo-' + Date.now(),
      email: email,
      name: fullName,
      fullName: fullName,
      role: role,
      phone: role === 'dispatcher' ? '9999999999' : '9876543210',
      bloodGroup: 'O+',
      isDemo: true,
      message: 'Login successful!'
    };
    
    res.json({
      success: true,
      ...demoUser
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed'
    });
  }
};

// ✅ Get profile
exports.getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Demo profile
    res.json({
      success: true,
      uid: 'demo-user',
      email: 'demo@system.com',
      name: 'Demo User',
      role: 'citizen',
      phone: '9876543210',
      bloodGroup: 'O+'
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get profile'
    });
  }
};

// ✅ Logout
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};