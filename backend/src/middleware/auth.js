const { auth } = require('../config/firebase');

// Verify token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Allow requests without token for development
      req.user = { uid: 'demo-user', role: 'citizen' };
      return next();
    }
    
    if (!auth) {
      req.user = { uid: 'demo-user', role: 'citizen' };
      return next();
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    req.user = { uid: 'demo-user', role: 'citizen' };
    next();
  }
};

// Check user role
const requireRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'citizen';
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };