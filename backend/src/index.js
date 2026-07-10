const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration - Allow all origins for production
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Requested-With']
}));

// ✅ Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// ✅ Import routes
const emergencyRoutes = require('./routes/emergencyRoutes');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

// ✅ Use routes
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// ✅ Health check
app.get('/api/health', (req, res) => {
  const dbStatus = process.env.USE_FIREBASE === 'true' ? 'Firebase Firestore' : 'In-Memory Storage';
  res.json({ 
    status: 'OK', 
    message: '🚀 Emergency System Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    routes: {
      auth: '/api/auth',
      emergencies: '/api/emergencies',
      ai: '/api/ai'
    }
  });
});

// ✅ Auth test route
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

// ✅ 404 handler
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('📡 Health check: http://localhost:' + PORT + '/api/health');
  console.log('🔧 Environment: ' + (process.env.NODE_ENV || 'development'));
  console.log('💾 Database: ' + (process.env.USE_FIREBASE === 'true' ? 'Firebase Firestore' : 'In-Memory Storage'));
  console.log('\n📋 Available Routes:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/auth/profile');
  console.log('   POST /api/emergencies/citizen');
  console.log('   POST /api/emergencies/dispatcher');
  console.log('   GET  /api/emergencies');
  console.log('   POST /api/ai/classify');
  console.log('   POST /api/ai/suggest');
});