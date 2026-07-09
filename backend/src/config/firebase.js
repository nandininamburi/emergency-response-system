const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Check if we should use Firebase
const useFirebase = process.env.USE_FIREBASE === 'true';

let db = null;
let auth = null;

if (useFirebase) {
  try {
    // Check if service account file exists
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.log('⚠️ serviceAccountKey.json not found in backend/src/config/');
      console.log('💡 Using in-memory storage instead');
    } else {
      // Load service account
      const serviceAccount = require(serviceAccountPath);
      
      // Initialize Firebase Admin SDK
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
      
      db = admin.firestore();
      auth = admin.auth();
      console.log('✅ Firebase initialized successfully');
      console.log(`📊 Project: ${serviceAccount.project_id}`);
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('⚠️ Falling back to in-memory storage');
    console.log('💡 Make sure serviceAccountKey.json is valid in backend/src/config/');
  }
} else {
  console.log('ℹ️ Using in-memory storage (set USE_FIREBASE=true to enable Firebase)');
}

module.exports = { db, auth };