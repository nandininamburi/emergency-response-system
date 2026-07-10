class AIService {
  async classifyEmergency(description) {
    return this.fallbackClassification(description);
  }

  fallbackClassification(description) {
    const lower = description.toLowerCase();
    
    if (lower.includes('fire') || lower.includes('smoke') || lower.includes('burn')) {
      return { category: 'Fire', priority: 'High', response: 'Fire Brigade' };
    } else if (lower.includes('accident') || lower.includes('crash') || lower.includes('collision')) {
      return { category: 'Accident', priority: 'High', response: 'Police+Ambulance' };
    } else if (lower.includes('stole') || lower.includes('theft') || lower.includes('robbery')) {
      return { category: 'Crime', priority: 'Medium', response: 'Police' };
    } else if (lower.includes('medical') || lower.includes('unconscious') || lower.includes('bleed')) {
      return { category: 'Medical', priority: 'High', response: 'Ambulance' };
    } else {
      return { category: 'Other', priority: 'Medium', response: 'Police' };
    }
  }

  async getSuggestions(query) {
    return ['Check for injuries', 'Call emergency services', 'Secure the area'];
  }
}

module.exports = new AIService();