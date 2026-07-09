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

async function createUsers() {
  try {
    console.log('📁 Creating users collection in Firebase...');
    
    const users = [
      {
        uid: 'citizen-001',
        email: 'citizen@system.com',
        fullName: 'Citizen User',
        phone: '9876543210',
        aadhar: '123456789012',
        bloodGroup: 'A+',
        role: 'citizen',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'police-001',
        email: 'police@system.com',
        fullName: 'Police Officer',
        phone: '8888888888',
        aadhar: '987654321012',
        bloodGroup: 'B+',
        role: 'police',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'dispatcher-001',
        email: 'dispatcher@system.com',
        fullName: 'System Dispatcher',
        phone: '9999999999',
        aadhar: '567890123456',
        bloodGroup: 'O+',
        role: 'dispatcher',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'arjun-001',
        email: 'arjun@gmail.com',
        fullName: 'Arjun Kumar',
        phone: '9876543211',
        aadhar: '111111111111',
        bloodGroup: 'B+',
        role: 'citizen',
        createdAt: new Date().toISOString()
      }
    ];
    
    let count = 0;
    for (const user of users) {
      try {
        // Check if user already exists
        const existing = await db.collection('users')
          .where('email', '==', user.email)
          .get();
        
        if (!existing.empty) {
          console.log(`⚠️ User already exists: ${user.fullName} (${user.email})`);
          continue;
        }
        
        const docRef = await db.collection('users').add(user);
        count++;
        console.log(`✅ Added user: ${user.fullName} (${user.role}) - ID: ${docRef.id}`);
      } catch (error) {
        console.error(`❌ Error adding user ${user.fullName}:`, error.message);
      }
    }
    
    console.log(`\n✅ Users collection created successfully!`);
    console.log(`📊 Total ${count} new users added`);
    console.log(`📁 Collection: users`);
    
    // Verify data
    const snapshot = await db.collection('users').get();
    console.log(`📋 Total users in Firebase: ${snapshot.size}`);
    
    console.log('\n📱 View your data:');
    console.log('  1. Firebase Console: https://console.firebase.google.com/');
    console.log('  2. Go to Firestore Database → users collection');
    console.log('  3. API: http://localhost:5000/api/auth/profile (login first)');
    
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    if (error.message.includes('7 PERMISSION_DENIED')) {
      console.log('\n💡 Permission denied. Make sure:');
      console.log('  1. Firestore is enabled in Firebase Console');
      console.log('  2. Security rules allow write access');
      console.log('  3. Service account has proper permissions');
    }
  }
}

// Run the function
createUsers();