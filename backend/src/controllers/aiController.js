const aiService = require('../services/aiService');

// Classify emergency
exports.classifyEmergency = async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description || description.length < 5) {
      return res.status(400).json({ 
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
    // Fallback classification based on keywords
    const description = req.body.description || '';
    const lower = description.toLowerCase();
    let category = 'Other', priority = 'Medium', response = 'Police';
    
    if (lower.includes('fire') || lower.includes('smoke') || lower.includes('burn')) {
      category = 'Fire';
      priority = 'High';
      response = 'Fire Brigade';
    } else if (lower.includes('accident') || lower.includes('crash') || lower.includes('collision')) {
      category = 'Accident';
      priority = 'High';
      response = 'Police+Ambulance';
    } else if (lower.includes('stole') || lower.includes('theft') || lower.includes('robbery')) {
      category = 'Crime';
      priority = 'Medium';
      response = 'Police';
    } else if (lower.includes('medical') || lower.includes('unconscious') || lower.includes('bleed')) {
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

// Get AI suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const { query } = req.body;
    
    const suggestions = [
      '🚗 Road accident at intersection',
      '🔥 Building fire with smoke',
      '🚨 Theft reported at parking',
      '🩺 Medical emergency with unconscious person',
      '🌊 Flooding in low-lying area'
    ].filter(s => s.toLowerCase().includes(query?.toLowerCase() || ''));
    
    res.json({
      success: true,
      suggestions: suggestions.length > 0 ? suggestions : ['No suggestions found']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};