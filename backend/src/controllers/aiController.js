const aiService = require('../services/aiService');

// Classify emergency
exports.classifyEmergency = async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description || description.length < 5) {
      return res.status(400).json({ 
        success: false,
        error: 'Description too short for classification',
        category: 'Other',
        priority: 'Medium',
        response: 'Police'
      });
    }
    
    const result = await aiService.classifyEmergency(description);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('AI classification error:', error);
    // Fallback
    const lower = (req.body.description || '').toLowerCase();
    let category = 'Other', priority = 'Medium', response = 'Police';
    
    if (lower.includes('fire') || lower.includes('smoke')) {
      category = 'Fire';
      priority = 'High';
      response = 'Fire Brigade';
    } else if (lower.includes('accident') || lower.includes('crash')) {
      category = 'Accident';
      priority = 'High';
      response = 'Police+Ambulance';
    } else if (lower.includes('theft') || lower.includes('robbery')) {
      category = 'Crime';
      priority = 'Medium';
      response = 'Police';
    } else if (lower.includes('medical') || lower.includes('unconscious')) {
      category = 'Medical';
      priority = 'High';
      response = 'Ambulance';
    }
    
    res.json({
      success: true,
      category,
      priority,
      response,
      note: 'Fallback classification used'
    });
  }
};

// Get suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const { query } = req.body;
    
    const suggestions = [
      '🚗 Road accident at intersection',
      '🔥 Building fire with smoke',
      '🚨 Theft reported at parking',
      '🩺 Medical emergency with unconscious person'
    ];
    
    const filtered = query ? suggestions.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    ) : suggestions;
    
    res.json({
      success: true,
      suggestions: filtered.length > 0 ? filtered : ['No suggestions found']
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};