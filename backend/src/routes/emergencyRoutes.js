const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

// ✅ Citizen reports
router.post('/citizen', emergencyController.createCitizenEmergency);

// ✅ Dispatcher SOS reports
router.post('/dispatcher', emergencyController.createDispatcherEmergency);

// ✅ Get all emergencies (FIFO)
router.get('/', emergencyController.getAllEmergencies);

// ✅ Get latest emergencies
router.get('/latest', emergencyController.getLatestEmergencies);

// ✅ Get emergency by complaint ID
router.get('/:id', emergencyController.getEmergencyById);

// ✅ Update emergency status
router.put('/:id', emergencyController.updateEmergency);

// ✅ Assign officer
router.post('/:id/assign', emergencyController.assignOfficer);

// ✅ Get by status
router.get('/status/:status', emergencyController.getEmergenciesByStatus);

// ✅ Delete emergency
router.delete('/:id', emergencyController.deleteEmergency);

module.exports = router;