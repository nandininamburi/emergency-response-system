const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

// ✅ Public routes
router.get('/', emergencyController.getAllEmergencies);
router.get('/latest', emergencyController.getLatestEmergencies);
router.get('/status/:status', emergencyController.getEmergenciesByStatus);
router.get('/:id', emergencyController.getEmergencyById);

// ✅ Protected routes (with simple auth check)
router.post('/citizen', emergencyController.createCitizenEmergency);
router.post('/dispatcher', emergencyController.createDispatcherEmergency);
router.put('/:id', emergencyController.updateEmergency);
router.post('/:id/assign', emergencyController.assignOfficer);
router.delete('/:id', emergencyController.deleteEmergency);

module.exports = router;