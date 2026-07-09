const Database = require('../config/database');

class Emergency {
  constructor(data) {
    // Generate a unique complaint ID that persists
    this.complaintId = this.generateComplaintId();
    
    // Store who sent the report
    this.reportType = data.reportType || 'citizen'; // 'citizen' or 'dispatcher'
    this.reporterRole = data.reporterRole || 'citizen';
    this.reporterName = data.reporterName || 'Anonymous';
    
    // Citizen fields (basic)
    this.name = data.name || 'Anonymous';
    this.phone = data.phone || '';
    this.description = data.description || '';
    this.emergencyType = data.emergencyType || 'Other';
    this.latitude = data.latitude || 12.9716;
    this.longitude = data.longitude || 77.5946;
    
    // Dispatcher fields (detailed)
    this.dispatcherName = data.dispatcherName || null;
    this.dispatcherPhone = data.dispatcherPhone || null;
    this.dispatcherAge = data.dispatcherAge || null;
    this.bloodGroup = data.bloodGroup || null;
    this.aadhar = data.aadhar || null;
    this.address = data.address || null;
    this.emergencyContact = data.emergencyContact || null;
    this.emergencyContactPhone = data.emergencyContactPhone || null;
    this.allergies = data.allergies || null;
    
    // Status fields
    this.status = data.status || 'Pending';
    this.priority = data.priority || 'Medium';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.assignedOfficer = data.assignedOfficer || null;
    this.officerId = data.officerId || null;
    this.voiceMessage = data.voiceMessage || null;
    this.photo = data.photo || null;
    this.aiPrediction = data.aiPrediction || null;
    this.updatedAt = data.updatedAt || null;
    
    // Auto-alert fields
    this.alertSent = data.alertSent || false;
    this.alertTimestamp = data.alertTimestamp || null;
    this.alertRecipients = data.alertRecipients || [];
  }

  // Generate persistent complaint ID (never changes)
  generateComplaintId() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timestamp = date.getTime().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    
    return `ER${year}${month}${day}-${timestamp}${random}`;
  }

  async save() {
    const emergencyData = { ...this };
    delete emergencyData.id;
    
    // Check if complaintId already exists, regenerate if needed
    const existing = await Database.query('emergencies', [
      { field: 'complaintId', op: '==', value: this.complaintId }
    ]);
    
    if (existing.length > 0) {
      // Regenerate if duplicate
      this.complaintId = this.generateComplaintId() + '-' + Math.floor(10 + Math.random() * 90);
      emergencyData.complaintId = this.complaintId;
    }
    
    const result = await Database.create('emergencies', emergencyData);
    return result;
  }

  static async getAll() {
    // FIFO: First come first served (oldest first)
    const emergencies = await Database.query('emergencies', [], { 
      field: 'timestamp', 
      direction: 'asc' 
    });
    return emergencies;
  }

  static async getLatest() {
    // Get latest emergencies (for dashboard)
    const emergencies = await Database.query('emergencies', [], { 
      field: 'timestamp', 
      direction: 'desc' 
    });
    return emergencies;
  }

  static async getByComplaintId(complaintId) {
    const results = await Database.query('emergencies', [
      { field: 'complaintId', op: '==', value: complaintId }
    ]);
    return results.length > 0 ? results[0] : null;
  }

  static async getByStatus(status) {
    const emergencies = await Database.query(
      'emergencies', 
      [{ field: 'status', op: '==', value: status }],
      { field: 'timestamp', direction: 'asc' }
    );
    return emergencies;
  }

  static async update(id, data) {
    let emergency = await Database.update('emergencies', id, data);
    if (emergency) return emergency;
    
    // If not found by ID, try complaintId
    const byComplaint = await this.getByComplaintId(id);
    if (byComplaint) {
      return await Database.update('emergencies', byComplaint.id, data);
    }
    return null;
  }

  static async delete(id) {
    return await Database.delete('emergencies', id);
  }
}

module.exports = Emergency;