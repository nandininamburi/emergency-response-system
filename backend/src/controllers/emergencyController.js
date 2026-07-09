const Emergency = require('../models/Emergency');
const aiService = require('../services/aiService');
const notificationService = require('../services/notificationService');

// Create emergency (Citizen form)
exports.createCitizenEmergency = async (req, res) => {
  try {
    const { description, name, phone, emergencyType } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    // AI Classification
    let aiPrediction = null;
    if (description && description.length > 10) {
      try {
        aiPrediction = await aiService.classifyEmergency(description);
      } catch (error) {
        console.error('AI classification failed:', error);
      }
    }
    
    const emergency = new Emergency({
      ...req.body,
      reportType: 'citizen',
      reporterRole: 'citizen',
      reporterName: name || 'Anonymous',
      aiPrediction,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      priority: aiPrediction?.priority || 'Medium'
    });
    
    const result = await emergency.save();
    
    // Send auto-alerts to dispatchers and hospitals
    await notificationService.sendAutoAlerts(result);
    
    res.status(201).json({
      success: true,
      complaintId: result.complaintId,
      emergencyId: result.id,
      message: 'Emergency reported successfully',
      aiPrediction,
      emergency: result
    });
  } catch (error) {
    console.error('Error creating emergency:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create emergency (Dispatcher form - SOS)
exports.createDispatcherEmergency = async (req, res) => {
  try {
    const { 
      dispatcherName, 
      dispatcherPhone, 
      dispatcherAge,
      emergencyType,
      description,
      latitude,
      longitude,
      bloodGroup,
      aadhar,
      address,
      emergencyContact,
      emergencyContactPhone,
      allergies
    } = req.body;
    
    if (!dispatcherName || !dispatcherPhone) {
      return res.status(400).json({ error: 'Dispatcher name and phone are required' });
    }
    
    // AI Classification for dispatcher reports
    let aiPrediction = null;
    if (description && description.length > 10) {
      try {
        aiPrediction = await aiService.classifyEmergency(description);
      } catch (error) {
        console.error('AI classification failed:', error);
      }
    }
    
    const emergency = new Emergency({
      reportType: 'dispatcher',
      reporterRole: 'dispatcher',
      reporterName: dispatcherName,
      dispatcherName,
      dispatcherPhone,
      dispatcherAge,
      name: dispatcherName, // For compatibility
      phone: dispatcherPhone, // For compatibility
      emergencyType: emergencyType || 'Other',
      description: description || 'SOS emergency reported by dispatcher',
      latitude: latitude || 12.9716,
      longitude: longitude || 77.5946,
      bloodGroup,
      aadhar,
      address,
      emergencyContact,
      emergencyContactPhone,
      allergies,
      aiPrediction,
      status: 'Pending',
      priority: 'High', // Dispatcher reports are always high priority
      timestamp: new Date().toISOString()
    });
    
    const result = await emergency.save();
    
    // Send immediate auto-alerts to police, hospitals, and officers
    await notificationService.sendAutoAlerts(result);
    await notificationService.notifyNearbyHospitals(result);
    
    res.status(201).json({
      success: true,
      complaintId: result.complaintId,
      emergencyId: result.id,
      message: '🚨 SOS Emergency reported successfully! Alert sent to authorities.',
      aiPrediction,
      emergency: result
    });
  } catch (error) {
    console.error('Error creating dispatcher emergency:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all emergencies (FIFO)
exports.getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.getAll();
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get latest emergencies (for dashboard)
exports.getLatestEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.getLatest();
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get emergency by Complaint ID
exports.getEmergencyById = async (req, res) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.getByComplaintId(id);
    
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    res.json(emergency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update emergency status
exports.updateEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const emergency = await Emergency.update(id, updates);
    
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    
    // Notify citizen about status update
    if (emergency && emergency.phone) {
      await notificationService.notifyCitizen(emergency);
    }
    
    res.json({ 
      success: true, 
      message: 'Emergency updated successfully',
      status: updates.status,
      complaintId: emergency.complaintId,
      emergency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign officer
exports.assignOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId, officerName } = req.body;
    
    const emergency = await Emergency.update(id, {
      assignedOfficer: officerName || 'Officer',
      officerId: officerId || 'OFF-001',
      status: 'Assigned',
      assignedAt: new Date().toISOString()
    });
    
    await notificationService.notifyOfficer({ name: officerName, id: officerId }, emergency);
    
    res.json({
      success: true,
      message: 'Officer assigned successfully',
      complaintId: emergency.complaintId,
      emergency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get emergencies by status
exports.getEmergenciesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const emergencies = await Emergency.getByStatus(status);
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete emergency
exports.deleteEmergency = async (req, res) => {
  try {
    await Emergency.delete(req.params.id);
    res.json({ success: true, message: 'Emergency deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};