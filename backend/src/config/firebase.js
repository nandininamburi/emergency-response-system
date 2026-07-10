const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const useFirebase = process.env.USE_FIREBASE === 'true';
let db = null;
let auth = null;

if (useFirebase) {
  try {
    let serviceAccount = null;
    
    // Try environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch (e) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', e.message);
      }
    }

    // Try file
    if (!serviceAccount) {
      const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
        console.log('✅ Loaded Firebase credentials from file');
      }
    }

    if (serviceAccount) {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
      db = admin.firestore();
      auth = admin.auth();
      console.log('✅ Firebase initialized successfully');
    } else {
      console.log('💡 No service account found. Using in-memory storage.');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('⚠️ Falling back to in-memory storage');
  }
} else {
  console.log('ℹ️ Using in-memory storage');
}

module.exports = { db, auth };