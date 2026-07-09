// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';
  
  // Handle specific errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  
  res.status(statusCode).json({
    error: message,
    status: statusCode,
    timestamp: new Date().toISOString()
  });
};

// Not found handler
const notFound = (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
};

module.exports = { errorHandler, notFound };