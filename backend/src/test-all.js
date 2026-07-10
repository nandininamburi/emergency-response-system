const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAll() {
  console.log('🧪 Running comprehensive API tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data:`, error.response.data);
      }
      failed++;
    }
  };
  
  // Test 1: Health Check
  await test('Health Check', async () => {
    const res = await axios.get(`${API_URL}/health`);
    if (res.data.status !== 'OK') throw new Error('Health check failed');
  });
  
  // Test 2: Auth Test Route
  await test('Auth Test Route', async () => {
    const res = await axios.get(`${API_URL}/auth/test`);
    if (!res.data.success) throw new Error('Auth test failed');
  });
  
  // Test 3: Register User
  let email = `test${Date.now()}@email.com`;
  await test('Register User', async () => {
    const res = await axios.post(`${API_URL}/auth/register`, {
      email: email,
      password: 'password123',
      fullName: 'Test User',
      phone: '9876543210',
      role: 'citizen'
    });
    if (!res.data.success) throw new Error('Registration failed');
  });
  
  // Test 4: Login
  let authToken = null;
  await test('Login', async () => {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: email,
      password: 'password123'
    });
    if (!res.data.success) throw new Error('Login failed');
    authToken = res.data.token || 'demo-token';
  });
  
  // Test 5: Get Profile
  await test('Get Profile', async () => {
    const res = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.data.success) throw new Error('Profile fetch failed');
  });
  
  // Test 6: Create Citizen Emergency
  let complaintId = null;
  await test('Create Citizen Emergency', async () => {
    const res = await axios.post(`${API_URL}/emergencies/citizen`, {
      name: 'Test User',
      phone: '9876543210',
      description: 'Test emergency description',
      emergencyType: 'Medical',
      latitude: 12.9716,
      longitude: 77.5946,
      bloodGroup: 'O+'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.data.success) throw new Error('Emergency creation failed');
    complaintId = res.data.complaintId;
  });
  
  // Test 7: Get All Emergencies
  await test('Get All Emergencies', async () => {
    const res = await axios.get(`${API_URL}/emergencies`);
    if (!res.data.success) throw new Error('Fetch failed');
    if (res.data.count < 1) throw new Error('No emergencies found');
  });
  
  // Test 8: Get Emergency by ID
  await test('Get Emergency by ID', async () => {
    if (!complaintId) throw new Error('No complaint ID available');
    const res = await axios.get(`${API_URL}/emergencies/${complaintId}`);
    if (!res.data.success) throw new Error('Emergency not found');
  });
  
  // Test 9: Update Emergency
  await test('Update Emergency', async () => {
    if (!complaintId) throw new Error('No complaint ID available');
    const res = await axios.put(`${API_URL}/emergencies/${complaintId}`, {
      status: 'Assigned'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.data.success) throw new Error('Update failed');
  });
  
  // Test 10: Get by Status
  await test('Get by Status', async () => {
    const res = await axios.get(`${API_URL}/emergencies/status/Pending`);
    if (!res.data.success) throw new Error('Status fetch failed');
  });
  
  // Test 11: AI Classification
  await test('AI Classification', async () => {
    const res = await axios.post(`${API_URL}/ai/classify`, {
      description: 'There is a fire in the building'
    });
    if (!res.data.success) throw new Error('AI classification failed');
  });
  
  // Test 12: AI Suggestions
  await test('AI Suggestions', async () => {
    const res = await axios.post(`${API_URL}/ai/suggest`, {
      query: 'fire'
    });
    if (!res.data.success) throw new Error('AI suggestions failed');
  });
  
  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! API is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.');
  }
}

testAll();