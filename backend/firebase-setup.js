const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔧 Firebase Setup Helper\n');
console.log('Current .env settings:');
console.log(`USE_FIREBASE = ${process.env.USE_FIREBASE}`);
console.log(`GOOGLE_CLOUD_PROJECT = ${process.env.GOOGLE_CLOUD_PROJECT || 'Not set'}`);
console.log('\n');

if (process.env.USE_FIREBASE !== 'true') {
  console.log('⚠️ Firebase is not enabled.');
  console.log('To enable Firebase:');
  console.log('1. Go to Firebase Console (https://console.firebase.google.com/)');
  console.log('2. Create a new project or use existing');
  console.log('3. Go to Project Settings > Service Accounts');
  console.log('4. Click "Generate new private key"');
  console.log('5. Save the JSON file as: backend/src/config/serviceAccountKey.json');
  console.log('6. Set USE_FIREBASE=true in .env');
  console.log('\nOR use Firebase Emulator for local development:');
  console.log('1. npm install -g firebase-tools');
  console.log('2. firebase init emulators');
  console.log('3. firebase emulators:start');
  console.log('4. Set USE_FIREBASE=true in .env');
} else {
  console.log('✅ Firebase is enabled!');
  
  const { db } = require('./src/config/firebase');
  
  if (db) {
    console.log('✅ Firebase connection successful!');
    
    // Test connection
    db.collection('test').doc('test').set({ test: true })
      .then(() => {
        console.log('✅ Firebase write test successful!');
        return db.collection('test').doc('test').delete();
      })
      .then(() => {
        console.log('✅ Firebase delete test successful!');
        console.log('🎉 Firebase is ready to use!');
      })
      .catch(err => {
        console.error('❌ Firebase test failed:', err.message);
        console.log('\n💡 Possible issues:');
        console.log('1. Firestore is not enabled in Firebase Console');
        console.log('2. Security rules are blocking access');
        console.log('3. Service account permissions are incorrect');
        console.log('\nTo fix security rules, go to:');
        console.log('Firebase Console > Firestore Database > Rules');
        console.log('Set rules to:');
        console.log('rules_version = "2";');
        console.log('service cloud.firestore {');
        console.log('  match /databases/{database}/documents {');
        console.log('    match /{document=**} {');
        console.log('      allow read, write: if true;');
        console.log('    }');
        console.log('  }');
        console.log('}');
      });
  } else {
    console.log('❌ Firebase is enabled but not connected.');
    console.log('Make sure serviceAccountKey.json exists in backend/src/config/');
  }
}