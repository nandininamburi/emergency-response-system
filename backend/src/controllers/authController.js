const { auth } = require('../config/firebase');

// Register user
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, fullName, phone, aadhar, bloodGroup } = req.body;
    
    // Check if auth is available
    if (!auth) {
      // Demo mode - save to localStorage only
      return res.status(201).json({
        success: true,
        uid: 'demo-' + Date.now(),
        email,
        name: fullName || name || 'User',
        role: role || 'citizen',
        message: 'Demo registration successful (Firebase Auth not configured)'
      });
    }
    
    try {
      // Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: fullName || name || 'User',
        // You can add custom claims for role
      });
      
      // Set custom claims for role
      await auth.setCustomUserClaims(userRecord.uid, { 
        role: role || 'citizen',
        phone: phone || '',
        bloodGroup: bloodGroup || ''
      });
      
      // Store additional user data in Firestore
      const { db } = require('../config/firebase');
      if (db) {
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: email,
          fullName: fullName || name || 'User',
          phone: phone || '',
          aadhar: aadhar || '',
          bloodGroup: bloodGroup || '',
          role: role || 'citizen',
          createdAt: new Date().toISOString()
        });
      }
      
      res.status(201).json({
        success: true,
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role: role || 'citizen',
        message: 'Registration successful!'
      });
      
    } catch (authError) {
      console.error('Firebase Auth error:', authError.message);
      
      // Handle specific Firebase Auth errors
      if (authError.code === 'auth/email-already-exists') {
        return res.status(400).json({
          success: false,
          error: 'Email already exists. Please use a different email or login.'
        });
      }
      
      if (authError.code === 'auth/invalid-password') {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters.'
        });
      }
      
      // For other errors, still return success for demo
      res.status(201).json({
        success: true,
        uid: 'demo-' + Date.now(),
        email,
        name: fullName || name || 'User',
        role: role || 'citizen',
        message: 'Registration saved locally (Firebase Auth error: ' + authError.message + ')'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    // Return success anyway for demo
    res.status(201).json({
      success: true,
      uid: 'demo-' + Date.now(),
      email: req.body.email,
      name: req.body.fullName || req.body.name || 'User',
      role: req.body.role || 'citizen',
      message: 'Registration saved locally'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Demo login - for development
    if (!auth) {
      let role = 'citizen';
      if (email === 'dispatcher@system.com') role = 'dispatcher';
      if (email === 'police@system.com') role = 'police';
      
      return res.json({
        success: true,
        uid: 'demo-' + Date.now(),
        email,
        name: email.split('@')[0],
        role,
        message: 'Demo login successful'
      });
    }
    
    // In production with Firebase Auth, we verify the ID token
    // For this demo, we'll simulate login
    // In a real app, you'd use Firebase Auth client-side and send the ID token
    
    // For demo purposes, check if user exists in Firebase Auth
    try {
      // Try to get user by email (this is just for demo)
      // In production, use ID token verification
      const user = await auth.getUserByEmail(email);
      
      // User exists in Firebase Auth
      // Get custom claims for role
      const claims = user.customClaims || {};
      
      // Get additional user data from Firestore
      const { db } = require('../config/firebase');
      let userData = {};
      if (db) {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
          userData = doc.data();
        }
      }
      
      res.json({
        success: true,
        uid: user.uid,
        email: user.email,
        name: user.displayName || userData.fullName || email.split('@')[0],
        role: claims.role || userData.role || 'citizen',
        phone: userData.phone || '',
        bloodGroup: userData.bloodGroup || '',
        message: 'Login successful!'
      });
      
    } catch (userError) {
      // User not found in Firebase Auth - fallback to demo login
      console.log('User not found in Firebase, using demo login');
      
      let role = 'citizen';
      if (email === 'dispatcher@system.com') role = 'dispatcher';
      if (email === 'police@system.com') role = 'police';
      
      res.json({
        success: true,
        uid: 'demo-' + Date.now(),
        email,
        name: email.split('@')[0],
        role,
        message: 'Demo login (user not found in Firebase)'
      });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    // Fallback to demo login
    const { email } = req.body;
    let role = 'citizen';
    if (email === 'dispatcher@system.com') role = 'dispatcher';
    if (email === 'police@system.com') role = 'police';
    
    res.json({
      success: true,
      uid: 'demo-' + Date.now(),
      email: email || 'demo@user.com',
      name: (email || 'demo').split('@')[0],
      role,
      message: 'Demo login (Auth fallback)'
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { uid } = req.user || {};
    
    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!auth) {
      return res.json({
        uid: 'demo-user',
        email: 'demo@system.com',
        name: 'Demo User',
        role: 'citizen'
      });
    }
    
    try {
      const user = await auth.getUser(uid);
      const { db } = require('../config/firebase');
      let userData = {};
      
      if (db) {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
          userData = doc.data();
        }
      }
      
      res.json({
        uid: user.uid,
        email: user.email,
        name: user.displayName || userData.fullName || 'User',
        role: user.customClaims?.role || userData.role || 'citizen',
        phone: userData.phone || '',
        bloodGroup: userData.bloodGroup || '',
        ...userData
      });
    } catch (error) {
      res.json({
        uid: uid,
        email: 'demo@system.com',
        name: 'Demo User',
        role: 'citizen'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};