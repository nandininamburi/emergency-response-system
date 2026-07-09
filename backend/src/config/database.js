const { db } = require('./firebase');

// In-memory storage fallback
const store = {
  emergencies: [],
  nextId: 1
};

const Database = {
  // Create document
  async create(collection, data) {
    if (db) {
      try {
        const docRef = await db.collection(collection).add(data);
        const doc = await docRef.get();
        return { id: docRef.id, ...doc.data() };
      } catch (error) {
        console.error('Firebase create error:', error.message);
        // Fallback to in-memory
      }
    }
    
    // In-memory fallback
    const id = String(store.nextId++);
    const doc = { id, ...data };
    store.emergencies.push(doc);
    return doc;
  },
  
  // Read document
  async read(collection, id) {
    if (db) {
      try {
        const doc = await db.collection(collection).doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
      } catch (error) {
        console.error('Firebase read error:', error.message);
      }
    }
    
    // In-memory fallback
    const doc = store.emergencies.find(e => e.id === id || e._id === id);
    return doc || null;
  },
  
  // Update document
  async update(collection, id, data) {
    if (db) {
      try {
        await db.collection(collection).doc(id).update({
          ...data,
          updatedAt: new Date().toISOString()
        });
        return this.read(collection, id);
      } catch (error) {
        console.error('Firebase update error:', error.message);
      }
    }
    
    // In-memory fallback
    const index = store.emergencies.findIndex(e => e.id === id || e._id === id);
    if (index !== -1) {
      store.emergencies[index] = { 
        ...store.emergencies[index], 
        ...data,
        updatedAt: new Date().toISOString()
      };
      return store.emergencies[index];
    }
    return null;
  },
  
  // Delete document
  async delete(collection, id) {
    if (db) {
      try {
        await db.collection(collection).doc(id).delete();
        return true;
      } catch (error) {
        console.error('Firebase delete error:', error.message);
      }
    }
    
    // In-memory fallback
    store.emergencies = store.emergencies.filter(e => e.id !== id && e._id !== id);
    return true;
  },
  
  // Query documents
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
    
    // In-memory fallback
    let results = [...store.emergencies];
    conditions.forEach(condition => {
      results = results.filter(item => {
        if (condition.op === '==') return item[condition.field] === condition.value;
        if (condition.op === '>') return item[condition.field] > condition.value;
        if (condition.op === '<') return item[condition.field] < condition.value;
        return true;
      });
    });
    if (orderBy) {
      results.sort((a, b) => {
        if (orderBy.direction === 'desc') {
          return b[orderBy.field] > a[orderBy.field] ? 1 : -1;
        }
        return a[orderBy.field] > b[orderBy.field] ? 1 : -1;
      });
    }
    return results;
  }
};

module.exports = Database;