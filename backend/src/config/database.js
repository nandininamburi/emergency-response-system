const { db } = require('./firebase');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data.json');

let store = {
  emergencies: [],
  nextId: 1
};

try {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    store = JSON.parse(data);
    console.log(`📂 Loaded ${store.emergencies.length} emergencies from data.json`);
  }
} catch (error) {
  console.log('⚠️ No data file found, starting fresh');
}

const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error('❌ Failed to save data:', error);
  }
};

const Database = {
  async create(collection, data) {
    if (db) {
      try {
        const docRef = await db.collection(collection).add(data);
        const doc = await docRef.get();
        return { id: docRef.id, ...doc.data() };
      } catch (error) {
        console.error('Firebase create error:', error.message);
      }
    }
    
    const id = String(store.nextId++);
    const doc = { id, ...data };
    if (!store[collection]) store[collection] = [];
    store[collection].push(doc);
    saveData();
    return doc;
  },
  
  async query(collection, conditions = [], orderBy = null) {
    if (db) {
      try {
        let query = db.collection(collection);
        conditions.forEach(condition => {
          query = query.where(condition.field, condition.op, condition.value);
        });
        if (orderBy) {
          query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Firebase query error:', error.message);
      }
    }
    
    let results = store[collection] ? [...store[collection]] : [];
    conditions.forEach(condition => {
      results = results.filter(item => {
        if (condition.op === '==') return item[condition.field] === condition.value;
        return true;
      });
    });
    if (orderBy) {
      results.sort((a, b) => {
        const aVal = a[orderBy.field] || '';
        const bVal = b[orderBy.field] || '';
        if (orderBy.direction === 'desc') return bVal > aVal ? 1 : -1;
        return aVal > bVal ? 1 : -1;
      });
    }
    return results;
  },
  
  async update(collection, id, data) {
    if (db) {
      try {
        await db.collection(collection).doc(id).update({
          ...data,
          updatedAt: new Date().toISOString()
        });
        const doc = await db.collection(collection).doc(id).get();
        return { id: doc.id, ...doc.data() };
      } catch (error) {
        console.error('Firebase update error:', error.message);
      }
    }
    
    const docs = store[collection] || [];
    const index = docs.findIndex(e => e.id === id || e._id === id);
    if (index !== -1) {
      docs[index] = { ...docs[index], ...data, updatedAt: new Date().toISOString() };
      saveData();
      return docs[index];
    }
    return null;
  },
  
  async delete(collection, id) {
    if (db) {
      try {
        await db.collection(collection).doc(id).delete();
        return true;
      } catch (error) {
        console.error('Firebase delete error:', error.message);
      }
    }
    
    if (store[collection]) {
      store[collection] = store[collection].filter(e => e.id !== id && e._id !== id);
      saveData();
      return true;
    }
    return true;
  }
};

module.exports = Database;