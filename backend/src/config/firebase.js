const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Check if we should use Firebase
const useFirebase = process.env.USE_FIREBASE === 'true';

let db = null;
let auth = null;
let serviceAccount = null;

if (useFirebase) {
  try {
    // FIRST: Try to get service account from environment variable (Render)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ Loaded Firebase credentials from environment variable (FIREBASE_SERVICE_ACCOUNT)');
      } catch (e) {
        console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT env:', e.message);
      }
    }

    // SECOND: If not found in env, try to load from file (local development)
    if (!serviceAccount) {
      const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
        console.log('✅ Loaded Firebase credentials from file: serviceAccountKey.json');
      } else {
        console.log('⚠️ serviceAccountKey.json not found in backend/src/config/');
      }
    }

    // If we have service account, initialize Firebase
    if (serviceAccount) {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
      
      db = admin.firestore();
      auth = admin.auth();
      console.log('✅ Firebase initialized successfully');
      console.log(`📊 Project: ${serviceAccount.project_id}`);
    } else {
      console.log('💡 No service account found. Using in-memory storage instead.');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('⚠️ Falling back to in-memory storage');
  }
} else {
  console.log('ℹ️ Using in-memory storage (set USE_FIREBASE=true to enable Firebase)');
}

module.exports = { db, auth };