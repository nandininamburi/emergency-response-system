const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('📡 Testing API endpoints...');
    
    // 1. Health check
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check:', health.data);
    
    // 2. Get all emergencies
    const emergencies = await axios.get(`${API_URL}/emergencies`);
    console.log(`✅ Total emergencies: ${emergencies.data.length}`);
    
    if (emergencies.data.length > 0) {
      console.log('📋 Sample emergency:', emergencies.data[0]);
    } else {
      console.log('⚠️ No emergencies found. Run seedData.js first.');
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

testAPI();