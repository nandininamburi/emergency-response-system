const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ✅ Register user
router.post('/register', authController.register);

// ✅ Login user
router.post('/login', authController.login);

// ✅ Get user profile
router.get('/profile', authController.getProfile);

// ✅ Logout user
router.post('/logout', authController.logout);

// ✅ Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;