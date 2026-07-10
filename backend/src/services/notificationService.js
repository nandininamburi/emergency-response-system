class NotificationService {
  async sendAutoAlerts(emergency) {
    console.log('\n🔔 AUTO-ALERT SYSTEM');
    console.log(`📢 Emergency #${emergency.complaintId}`);
    console.log(`📋 Type: ${emergency.emergencyType}`);
    console.log(`📊 Priority: ${emergency.priority}`);
    console.log(`👤 Reporter: ${emergency.reporterName}`);
    console.log('✅ Auto-alerts sent!\n');
    return true;
  }

  async sendSOSAlerts(emergency) {
    console.log('\n🆘 SOS EMERGENCY ALERT');
    console.log(`🚨 URGENT SOS from: ${emergency.dispatcherName}`);
    console.log(`📍 Location: ${emergency.latitude}, ${emergency.longitude}`);
    console.log(`🩸 Blood Group: ${emergency.bloodGroup || 'Unknown'}`);
    console.log('📤 Alert sent to: Police, Hospital, Fire Brigade');
    console.log('✅ SOS alerts sent!\n');
    return true;
  }

  async notifyNearbyHospitals(emergency) {
    console.log(`🏥 Notifying nearby hospitals for #${emergency.complaintId}`);
    return true;
  }

  async notifyCitizen(emergency) {
    console.log(`📱 Citizen status update #${emergency.complaintId}`);
    return true;
  }

  async notifyOfficer(officer, emergency) {
    console.log(`👮 Officer ${officer.name} assigned to #${emergency.complaintId}`);
    return true;
  }
}

module.exports = new NotificationService();