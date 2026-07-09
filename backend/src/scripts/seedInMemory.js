const Database = require('../config/database');

const sampleEmergencies = [
  {
    name: "Rahul Sharma",
    phone: "+919876543210",
    email: "rahul@email.com",
    aadhar: "123456789012",
    bloodGroup: "O+",
    emergencyType: "Road Accident",
    description: "Car collided with bike at MG Road intersection. Two people injured.",
    latitude: 12.9716,
    longitude: 77.5946,
    status: "Pending",
    priority: "High",
    timestamp: new Date().toISOString(),
    assignedOfficer: null,
    address: "MG Road, Bangalore",
    createdAt: new Date().toISOString()
  },
  {
    name: "Priya Patel",
    phone: "+919876543211",
    email: "priya@email.com",
    aadhar: "123456789013",
    bloodGroup: "B+",
    emergencyType: "Fire",
    description: "Building fire at Indiranagar. Smoke coming from 3rd floor. People trapped.",
    latitude: 12.9812,
    longitude: 77.7200,
    status: "Assigned",
    priority: "Critical",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    assignedOfficer: "Officer Kumar",
    address: "Indiranagar, Bangalore",
    createdAt: new Date().toISOString()
  },
  {
    name: "Amit Kumar",
    phone: "+919876543212",
    email: "amit@email.com",
    aadhar: "123456789014",
    bloodGroup: "A+",
    emergencyType: "Medical",
    description: "Elderly person unconscious at Koramangala. Need immediate ambulance.",
    latitude: 12.9550,
    longitude: 77.7400,
    status: "On Route",
    priority: "High",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    assignedOfficer: "Officer Singh",
    address: "Koramangala, Bangalore",
    createdAt: new Date().toISOString()
  },
  {
    name: "Sneha Reddy",
    phone: "+919876543213",
    email: "sneha@email.com",
    aadhar: "123456789015",
    bloodGroup: "AB+",
    emergencyType: "Crime",
    description: "Theft reported at Jayanagar parking lot. CCTV footage available.",
    latitude: 12.9650,
    longitude: 77.7100,
    status: "Resolved",
    priority: "Medium",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    assignedOfficer: "Officer Patel",
    address: "Jayanagar, Bangalore",
    createdAt: new Date().toISOString()
  }
];

async function seedInMemory() {
  try {
    console.log('🌱 Seeding in-memory database with sample emergencies...');
    console.log('📊 Database mode: In-Memory Storage');
    
    for (const emergency of sampleEmergencies) {
      const result = await Database.create('emergencies', emergency);
      console.log(`✅ Added: ${emergency.emergencyType} (ID: ${result.id}) - ${emergency.name}`);
    }
    
    console.log('\n✅ Seeding complete!');
    console.log(`📊 Total ${sampleEmergencies.length} emergencies added to in-memory storage`);
    
    // Verify data
    const allData = await Database.query('emergencies');
    console.log(`📋 Total records in database: ${allData.length}`);
    
    console.log('\n📱 View your data:');
    console.log('  1. API: http://localhost:5000/api/emergencies');
    console.log('  2. Police Dashboard: http://localhost:5173/police');
    console.log('  3. Dispatcher Dashboard: http://localhost:5173/dispatcher');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seed function
seedInMemory();