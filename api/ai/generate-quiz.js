const { callGeminiApi, parseAiJson, applyCors } = require('../utils.js');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic, grammar, vocabulary, level } = req.body || {};

  const prompt = `
Create 3 high-quality multiple choice comprehension and grammar assessment questions for:
Topic: ${topic || 'English Communication'}
Grammar Target: ${grammar || 'English Grammar'}
Vocabulary Focus: ${vocabulary || 'Vocabulary'}
Level: ${level || 'Intermediate (B1)'}

Respond with a JSON object strictly matching this schema:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text testing grammar or vocabulary context?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed pedagogical explanation of why this answer is correct."
    }
  ]
}`;

  try {
    const aiResponse = await callGeminiApi(prompt, 'You are an educational assessment specialist designing CEFR-aligned English questions.', true, req);
    const parsed = parseAiJson(aiResponse);
    res.status(200).json({ success: true, data: parsed });
  } catch (err) {
    console.error('Error generating quiz:', err.message);
    res.status(500).json({ error: err.message });
  }
};
