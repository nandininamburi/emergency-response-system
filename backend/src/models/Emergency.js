const Database = require('../config/database');

class Emergency {
  constructor(data) {
    this.complaintId = this.generateComplaintId();
    
    // Report metadata
    this.reportType = data.reportType || 'citizen';
    this.reporterRole = data.reporterRole || 'citizen';
    this.reporterName = data.reporterName || 'Anonymous';
    
    // Basic fields
    this.name = data.name || 'Anonymous';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.description = data.description || '';
    this.emergencyType = data.emergencyType || 'Other';
    this.latitude = data.latitude || 12.9716;
    this.longitude = data.longitude || 77.5946;
    this.address = data.address || null;
    
    // Dispatcher fields
    this.dispatcherName = data.dispatcherName || null;
    this.dispatcherPhone = data.dispatcherPhone || null;
    this.bloodGroup = data.bloodGroup || null;
    this.aadhar = data.aadhar || null;
    this.allergies = data.allergies || null;
    this.emergencyContact = data.emergencyContact || null;
    this.emergencyContactPhone = data.emergencyContactPhone || null;
    
    // Status fields
    this.status = data.status || 'Pending';
    this.priority = data.priority || 'Medium';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || null;
    this.assignedOfficer = data.assignedOfficer || null;
    this.officerId = data.officerId || null;
    this.assignedAt = data.assignedAt || null;
    
    // Media
    this.voiceMessage = data.voiceMessage || null;
    this.photo = data.photo || null;
    
    // AI
    this.aiPrediction = data.aiPrediction || null;
    
    // Alerts
    this.alertSent = data.alertSent || false;
    this.alertTimestamp = data.alertTimestamp || null;
  }

  generateComplaintId() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const random = Math.floor(100 + Math.random() * 900);
    
    return `ER${year}${month}${day}-${hours}${minutes}${seconds}${random}`;
  }

  async save() {
    const emergencyData = { ...this };
    delete emergencyData.id;
    
    const existing = await Database.query('emergencies', [
      { field: 'complaintId', op: '==', value: this.complaintId }
    ]);
    
    if (existing.length > 0) {
      this.complaintId = this.generateComplaintId() + '-' + Math.floor(10 + Math.random() * 90);
      emergencyData.complaintId = this.complaintId;
    }
    
    const result = await Database.create('emergencies', emergencyData);
    return result;
  }

  static async getAll() {
    return await Database.query('emergencies', [], { 
      field: 'timestamp', 
      direction: 'asc' 
    });
  }

  static async getLatest() {
    return await Database.query('emergencies', [], { 
      field: 'timestamp', 
      direction: 'desc' 
    });
  }

  static async getByComplaintId(complaintId) {
    const results = await Database.query('emergencies', [
      { field: 'complaintId', op: '==', value: complaintId }
    ]);
    return results.length > 0 ? results[0] : null;
  }

  static async getByStatus(status) {
    return await Database.query(
      'emergencies', 
      [{ field: 'status', op: '==', value: status }],
      { field: 'timestamp', direction: 'asc' }
    );
  }

  static async update(id, data) {
    let emergency = await Database.update('emergencies', id, data);
    if (emergency) return emergency;
    
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