const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔍 Testing Firebase Connection...');
console.log(`📋 USE_FIREBASE = ${process.env.USE_FIREBASE}`);

if (process.env.USE_FIREBASE !== 'true') {
  console.log('❌ Firebase is disabled. Set USE_FIREBASE=true in .env');
  process.exit(1);
}

const { db } = require('../config/firebase');

if (!db) {
  console.log('❌ Firebase database not available.');
  console.log('💡 Make sure serviceAccountKey.json exists in backend/src/config/');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('✅ Firebase database loaded');
    
    // Try to read from Firebase
    const snapshot = await db.collection('emergencies').limit(1).get();
    console.log(`✅ Connected to Firebase successfully!`);
    console.log(`📋 Collection 'emergencies' exists with ${snapshot.size} documents`);
    
    if (snapshot.size === 0) {
      console.log('📭 Collection is empty. Run seedFirebase.js to add data.');
    }
    
  } catch (error) {
    console.error('❌ Firebase connection error:', error.message);
    if (error.message.includes('7 PERMISSION_DENIED')) {
      console.log('\n💡 Permission denied. Check:');
      console.log('  1. Firestore is enabled in Firebase Console');
      console.log('  2. Security rules allow access');
      console.log('  3. Service account has proper permissions');
    }
  }
}

testConnection();