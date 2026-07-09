const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Classify emergency
router.post('/classify', aiController.classifyEmergency);

// Get suggestions
router.post('/suggest', aiController.getSuggestions);

module.exports = router;