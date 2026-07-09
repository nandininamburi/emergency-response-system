const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
  }

  async classifyEmergency(description) {
    try {
      // If no API key, use fallback classification
      if (!this.genAI) {
        return this.fallbackClassification(description);
      }
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        Classify this emergency report:
        "${description}"
        
        Return only valid JSON with these fields:
        - category: [Accident, Fire, Crime, Medical, Other]
        - priority: [High, Medium, Low]
        - response: [Police, Ambulance, Fire Brigade, Police+Ambulance]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse JSON
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('AI classification error:', error);
      return this.fallbackClassification(description);
    }
  }

  fallbackClassification(description) {
    const lower = description.toLowerCase();
    
    if (lower.includes('fire') || lower.includes('smoke') || lower.includes('burn') || lower.includes('flame')) {
      return { category: 'Fire', priority: 'High', response: 'Fire Brigade' };
    } else if (lower.includes('accident') || lower.includes('crash') || lower.includes('collision') || lower.includes('collide')) {
      return { category: 'Accident', priority: 'High', response: 'Police+Ambulance' };
    } else if (lower.includes('stole') || lower.includes('theft') || lower.includes('rob') || lower.includes('break')) {
      return { category: 'Crime', priority: 'Medium', response: 'Police' };
    } else if (lower.includes('medical') || lower.includes('unconscious') || lower.includes('bleed') || lower.includes('hurt')) {
      return { category: 'Medical', priority: 'High', response: 'Ambulance' };
    } else {
      return { category: 'Other', priority: 'Medium', response: 'Police' };
    }
  }

  async getSuggestions(query) {
    try {
      if (!this.genAI) {
        return ['Check for injuries', 'Call emergency services', 'Secure the area'];
      }
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Give 3 quick suggestions for: "${query}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().split('\n').filter(s => s.trim());
    } catch (error) {
      console.error('Suggestion error:', error);
      return ['Check for injuries', 'Call emergency services', 'Secure the area'];
    }
  }
}

module.exports = new AIService();