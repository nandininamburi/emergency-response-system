const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');
  
  try {
    // 1. Health check
    console.log('📡 Testing Health Check...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check:', health.data);
    console.log('');
    
    // 2. Auth test
    console.log('📡 Testing Auth Routes...');
    const authTest = await axios.get(`${API_URL}/auth/test`);
    console.log('✅ Auth Test:', authTest.data);
    console.log('');
    
    // 3. Register
    console.log('📡 Testing Registration...');
    const registerData = {
      email: `test${Date.now()}@email.com`,
      password: 'password123',
      fullName: 'Test User',
      phone: '9876543210',
      role: 'citizen'
    };
    const register = await axios.post(`${API_URL}/auth/register`, registerData);
    console.log('✅ Registration:', register.data);
    console.log('');
    
    // 4. Login
    console.log('📡 Testing Login...');
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('✅ Login:', login.data);
    console.log('');
    
    // 5. Get all emergencies
    console.log('📡 Testing Get Emergencies...');
    const emergencies = await axios.get(`${API_URL}/emergencies`);
    console.log(`✅ Total emergencies: ${emergencies.data.count || emergencies.data.length}`);
    console.log('');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();