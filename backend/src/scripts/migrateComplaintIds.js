const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { db } = require('../config/firebase');

async function migrateComplaintIds() {
  try {
    console.log('🔄 Migrating existing records with new Complaint IDs...');
    
    const snapshot = await db.collection('emergencies').get();
    let count = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Check if complaintId already exists
      if (!data.complaintId) {
        const date = new Date(data.timestamp || Date.now());
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        const timestamp = date.getTime().toString().slice(-6);
        
        const complaintId = `ER${year}${month}${day}-${timestamp}`;
        
        await doc.ref.update({ complaintId });
        count++;
        console.log(`✅ Updated ${doc.id} → ${complaintId}`);
      }
    }
    
    console.log(`\n✅ Migration complete! Updated ${count} documents.`);
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
}

migrateComplaintIds();