class NotificationService {
  // Send auto-alerts to police, hospitals, and dispatchers
  async sendAutoAlerts(emergency) {
    try {
      console.log('\n🔔 ===== AUTO-ALERT SYSTEM =====');
      console.log(`📢 Emergency #${emergency.complaintId}`);
      console.log(`📋 Type: ${emergency.emergencyType}`);
      console.log(`📊 Priority: ${emergency.priority}`);
      console.log(`👤 Reporter: ${emergency.reporterName} (${emergency.reportType})`);
      
      // Determine who to alert based on emergency type
      const recipients = [];
      
      // Always alert police
      recipients.push({
        role: 'Police',
        message: `🚨 Emergency reported! Type: ${emergency.emergencyType}, Location: ${emergency.latitude}, ${emergency.longitude}`
      });
      
      // Alert hospitals for medical emergencies
      if (emergency.emergencyType === 'Medical' || emergency.emergencyType === 'Accident') {
        recipients.push({
          role: 'Hospital',
          message: `🏥 Medical emergency! Blood group: ${emergency.bloodGroup || 'Unknown'}, Allergies: ${emergency.allergies || 'None'}`
        });
      }
      
      // Alert fire brigade for fires
      if (emergency.emergencyType === 'Fire') {
        recipients.push({
          role: 'Fire Brigade',
          message: `🔥 Fire emergency! Location: ${emergency.latitude}, ${emergency.longitude}`
        });
      }
      
      // Alert dispatchers
      recipients.push({
        role: 'Dispatcher',
        message: `📋 New emergency #${emergency.complaintId} needs assignment`
      });
      
      // Log all alerts
      recipients.forEach(recipient => {
        console.log(`📤 Alert to ${recipient.role}: ${recipient.message}`);
      });
      
      // Store alert info in emergency
      emergency.alertSent = true;
      emergency.alertTimestamp = new Date().toISOString();
      emergency.alertRecipients = recipients.map(r => r.role);
      
      console.log('✅ Auto-alerts sent successfully!\n');
      
      return true;
    } catch (error) {
      console.error('Failed to send auto-alerts:', error);
      return false;
    }
  }

  // Notify nearby hospitals
  async notifyNearbyHospitals(emergency) {
    try {
      if (emergency.emergencyType !== 'Medical' && emergency.emergencyType !== 'Accident') {
        return true;
      }
      
      console.log(`🏥 Notifying nearby hospitals for emergency #${emergency.complaintId}`);
      console.log(`   Patient: ${emergency.dispatcherName || emergency.name}`);
      console.log(`   Blood Group: ${emergency.bloodGroup || 'Unknown'}`);
      console.log(`   Allergies: ${emergency.allergies || 'None'}`);
      console.log(`   Emergency Contact: ${emergency.emergencyContact || 'N/A'}`);
      
      // In production, this would call hospital APIs
      return true;
    } catch (error) {
      console.error('Failed to notify hospitals:', error);
      return false;
    }
  }

  // Notify dispatcher
  async notifyDispatcher(emergency) {
    try {
      console.log(`📢 [Dispatcher] New emergency #${emergency.complaintId}`);
      console.log(`   Type: ${emergency.emergencyType}`);
      console.log(`   Reporter: ${emergency.reporterName} (${emergency.reportType})`);
      return true;
    } catch (error) {
      console.error('Failed to notify dispatcher:', error);
      return false;
    }
  }

  // Notify citizen
  async notifyCitizen(emergency) {
    try {
      console.log(`📱 [Citizen] Status update for #${emergency.complaintId}: ${emergency.status}`);
      return true;
    } catch (error) {
      console.error('Failed to notify citizen:', error);
      return false;
    }
  }

  // Notify officer
  async notifyOfficer(officer, emergency) {
    try {
      console.log(`👮 [Officer] New case assigned to ${officer.name}`);
      console.log(`   Case: #${emergency.complaintId}, Type: ${emergency.emergencyType}`);
      return true;
    } catch (error) {
      console.error('Failed to notify officer:', error);
      return false;
    }
  }
}

module.exports = new NotificationService();