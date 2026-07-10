const Emergency = require('../models/Emergency');
const aiService = require('../services/aiService');
const notificationService = require('../services/notificationService');

// ✅ Create citizen emergency
exports.createCitizenEmergency = async (req, res) => {
  try {
    console.log('📝 Creating citizen emergency...');
    
    const { name, phone, description, emergencyType, latitude, longitude } = req.body;
    
    if (!description) {
      return res.status(400).json({ 
        success: false,
        error: 'Description is required' 
      });
    }
    
    // AI Classification
    let aiPrediction = null;
    if (description && description.length > 10) {
      try {
        aiPrediction = await aiService.classifyEmergency(description);
        console.log('🤖 AI Prediction:', aiPrediction);
      } catch (error) {
        console.error('AI classification failed:', error);
      }
    }
    
    const emergencyData = {
      reportType: 'citizen',
      reporterRole: 'citizen',
      reporterName: name || 'Anonymous',
      name: name || 'Anonymous',
      phone: phone || '',
      description: description,
      emergencyType: emergencyType || 'Other',
      latitude: latitude || 12.9716,
      longitude: longitude || 77.5946,
      aiPrediction: aiPrediction || null,
      status: 'Pending',
      priority: aiPrediction?.priority || 'Medium',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    const emergency = new Emergency(emergencyData);
    const result = await emergency.save();
    
    console.log('✅ Emergency saved:', result.complaintId);
    
    // Send notifications
    await notificationService.sendAutoAlerts(result);
    
    res.status(201).json({
      success: true,
      complaintId: result.complaintId,
      message: 'Emergency reported successfully',
      aiPrediction: aiPrediction || null
    });
    
  } catch (error) {
    console.error('❌ Error creating emergency:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to report emergency'
    });
  }
};

// ✅ Create dispatcher emergency (SOS)
exports.createDispatcherEmergency = async (req, res) => {
  try {
    console.log('📝 Creating dispatcher emergency (SOS)...');
    
    const { dispatcherName, dispatcherPhone, emergencyType, description, latitude, longitude, bloodGroup } = req.body;
    
    if (!dispatcherName || !dispatcherPhone) {
      return res.status(400).json({ 
        success: false,
        error: 'Dispatcher name and phone are required' 
      });
    }
    
    // AI Classification
    let aiPrediction = null;
    if (description && description.length > 10) {
      try {
        aiPrediction = await aiService.classifyEmergency(description);
        console.log('🤖 AI Prediction:', aiPrediction);
      } catch (error) {
        console.error('AI classification failed:', error);
      }
    }
    
    const emergencyData = {
      reportType: 'dispatcher',
      reporterRole: 'dispatcher',
      reporterName: dispatcherName,
      dispatcherName: dispatcherName,
      dispatcherPhone: dispatcherPhone,
      name: dispatcherName,
      phone: dispatcherPhone,
      emergencyType: emergencyType || 'Other',
      description: description || 'SOS emergency reported by dispatcher',
      latitude: latitude || 12.9716,
      longitude: longitude || 77.5946,
      bloodGroup: bloodGroup || null,
      aiPrediction: aiPrediction || null,
      status: 'Pending',
      priority: 'Critical',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    const emergency = new Emergency(emergencyData);
    const result = await emergency.save();
    
    console.log('✅ SOS Emergency saved:', result.complaintId);
    
    // Send urgent alerts
    await notificationService.sendAutoAlerts(result);
    await notificationService.sendSOSAlerts(result);
    
    res.status(201).json({
      success: true,
      complaintId: result.complaintId,
      message: '🚨 SOS Emergency reported successfully!',
      aiPrediction: aiPrediction || null
    });
    
  } catch (error) {
    console.error('❌ Error creating dispatcher emergency:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to submit SOS emergency'
    });
  }
};

// ✅ Get all emergencies
exports.getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.getAll();
    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    console.error('Error fetching emergencies:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch emergencies'
    });
  }
};

// ✅ Get latest emergencies
exports.getLatestEmergencies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const emergencies = await Emergency.getLatest();
    const latest = emergencies.slice(0, limit);
    
    res.json({
      success: true,
      count: latest.length,
      data: latest
    });
  } catch (error) {
    console.error('Error fetching latest emergencies:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch latest emergencies'
    });
  }
};

// ✅ Get emergency by ID
exports.getEmergencyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Complaint ID is required' 
      });
    }
    
    const emergency = await Emergency.getByComplaintId(id);
    
    if (!emergency) {
      return res.status(404).json({ 
        success: false,
        error: 'Emergency not found' 
      });
    }
    
    res.json({
      success: true,
      data: emergency
    });
  } catch (error) {
    console.error('Error fetching emergency:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch emergency'
    });
  }
};

// ✅ Update emergency
exports.updateEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Complaint ID is required' 
      });
    }
    
    updates.updatedAt = new Date().toISOString();
    const emergency = await Emergency.update(id, updates);
    
    if (!emergency) {
      return res.status(404).json({ 
        success: false,
        error: 'Emergency not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Emergency updated successfully',
      data: emergency
    });
  } catch (error) {
    console.error('Error updating emergency:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to update emergency'
    });
  }
};

// ✅ Assign officer
exports.assignOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId, officerName } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Complaint ID is required' 
      });
    }
    
    const updates = {
      assignedOfficer: officerName || 'Officer',
      officerId: officerId || 'OFF-001',
      status: 'Assigned',
      assignedAt: new Date().toISOString()
    };
    
    const emergency = await Emergency.update(id, updates);
    
    if (!emergency) {
      return res.status(404).json({ 
        success: false,
        error: 'Emergency not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Officer assigned successfully',
      data: emergency
    });
  } catch (error) {
    console.error('Error assigning officer:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to assign officer'
    });
  }
};

// ✅ Get by status
exports.getEmergenciesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!status) {
      return res.status(400).json({ 
        success: false,
        error: 'Status is required' 
      });
    }
    
    const emergencies = await Emergency.getByStatus(status);
    
    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    console.error('Error fetching emergencies by status:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch emergencies'
    });
  }
};

// ✅ Delete emergency
exports.deleteEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Complaint ID is required' 
      });
    }
    
    const emergency = await Emergency.getByComplaintId(id);
    if (!emergency) {
      return res.status(404).json({ 
        success: false,
        error: 'Emergency not found' 
      });
    }
    
    await Emergency.delete(emergency.id);
    
    res.json({ 
      success: true, 
      message: 'Emergency deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting emergency:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to delete emergency'
    });
  }
};