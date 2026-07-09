const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Check if Firebase is enabled
if (process.env.USE_FIREBASE !== 'true') {
  console.log('❌ Firebase is not enabled. Set USE_FIREBASE=true in .env');
  console.log('💡 Current value:', process.env.USE_FIREBASE);
  process.exit(1);
}

// Import Firebase config
const { db } = require('../config/firebase');

// Check if db is available
if (!db) {
  console.log('❌ Firebase database not available.');
  console.log('💡 Make sure serviceAccountKey.json exists in backend/src/config/');
  process.exit(1);
}

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

async function seedFirebase() {
  try {
    console.log('🌱 Seeding Firebase Firestore with sample emergencies...');
    console.log(`📊 Project: ${process.env.GOOGLE_CLOUD_PROJECT || 'emergency-response-syste-53521'}`);
    console.log(`📁 Collection: emergencies`);
    console.log(`📝 Total documents to add: ${sampleEmergencies.length}`);
    
    let count = 0;
    for (const emergency of sampleEmergencies) {
      const docRef = await db.collection('emergencies').add(emergency);
      count++;
      console.log(`✅ ${count}. Added: ${emergency.emergencyType} (ID: ${docRef.id}) - ${emergency.name}`);
    }
    
    console.log('\n✅ Seeding complete!');
    console.log(`📊 Total ${sampleEmergencies.length} emergencies added to Firebase`);
    
    // Verify data
    const snapshot = await db.collection('emergencies').get();
    console.log(`📋 Total records in Firebase: ${snapshot.size}`);
    
    console.log('\n📱 View your data:');
    console.log('  1. Firebase Console: https://console.firebase.google.com/');
    console.log('  2. Go to Firestore Database → emergencies collection');
    console.log('  3. API: http://localhost:5000/api/emergencies');
    console.log('  4. Police Dashboard: http://localhost:5173/police');
    console.log('  5. Dispatcher Dashboard: http://localhost:5173/dispatcher');
    
  } catch (error) {
    console.error('❌ Error seeding Firebase:', error.message);
    if (error.message.includes('7 PERMISSION_DENIED')) {
      console.log('\n💡 Permission denied. Make sure:');
      console.log('  1. Firestore is enabled in Firebase Console');
      console.log('  2. Security rules allow write access');
      console.log('  3. Service account has proper permissions');
    }
  }
}

// Run the seed function
seedFirebase();