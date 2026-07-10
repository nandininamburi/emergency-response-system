const { auth } = require('../config/firebase');

// Verify token middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For development, allow requests without token
      console.log('⚠️ No token provided, using demo user');
      req.user = { 
        uid: 'demo-' + Date.now(), 
        role: 'citizen',
        email: 'demo@system.com',
        isDemo: true
      };
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!auth) {
      // Firebase not available, use demo user
      req.user = { 
        uid: 'demo-' + Date.now(), 
        role: 'citizen',
        email: 'demo@system.com',
        isDemo: true
      };
      return next();
    }
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'citizen',
        ...decodedToken
      };
      console.log(`✅ Auth: ${req.user.email} (${req.user.role})`);
      next();
    } catch (verifyError) {
      console.error('❌ Token verification failed:', verifyError.message);
      // Fallback for development
      req.user = { 
        uid: 'demo-' + Date.now(), 
        role: 'citizen',
        email: 'demo@system.com',
        isDemo: true
      };
      next();
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    req.user = { 
      uid: 'demo-' + Date.now(), 
      role: 'citizen',
      email: 'demo@system.com',
      isDemo: true
    };
    next();
  }
};

// Check user role
const requireRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'citizen';
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false,
        error: 'Insufficient permissions',
        requiredRoles: roles,
        userRole: userRole
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };