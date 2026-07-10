const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testDashboard() {
  console.log('📊 Dashboard API Test\n');
  
  try {
    // 1. Get all emergencies
    console.log('📋 Fetching all emergencies...');
    const all = await axios.get(`${BASE_URL}/emergencies`);
    console.log(`✅ Total: ${all.data.count || all.data.length}`);
    if (all.data.data && all.data.data.length > 0) {
      console.log('📝 Sample:', all.data.data[0]);
    }
    console.log('');
    
    // 2. Get latest emergencies
    console.log('📋 Fetching latest emergencies...');
    const latest = await axios.get(`${BASE_URL}/emergencies/latest?limit=5`);
    console.log(`✅ Latest: ${latest.data.count || latest.data.length}`);
    console.log('');
    
    // 3. Get by status
    const statuses = ['Pending', 'Assigned', 'On Route', 'Resolved'];
    for (const status of statuses) {
      try {
        const result = await axios.get(`${BASE_URL}/emergencies/status/${status}`);
        console.log(`✅ ${status}: ${result.data.count || result.data.length}`);
      } catch (e) {
        console.log(`❌ ${status}: Not found`);
      }
    }
    console.log('');
    
    // 4. Create a test emergency (citizen)
    console.log('📋 Creating test emergency...');
    const testEmergency = {
      name: "Test User",
      phone: "9876543210",
      emergencyType: "Medical",
      description: "Test emergency from dashboard test",
      latitude: 12.9716,
      longitude: 77.5946,
      bloodGroup: "O+"
    };
    
    const created = await axios.post(`${BASE_URL}/emergencies/citizen`, testEmergency);
    console.log('✅ Emergency created:', created.data.complaintId);
    console.log('');
    
    console.log('🎉 Dashboard tests completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDashboard();