const { callGeminiApi, parseAiJson } = require('../utils.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { subject, level, theme } = req.body;

  const prompt = `
Create an engaging school curriculum reading text and topic analysis for English language learners:
Subject / Theme: ${subject || theme || 'Global Cultures and Travel'}
CEFR Level: ${level || 'Intermediate (B1)'}

Respond with a JSON object:
{
  "topicTitle": "Engaging Curriculum Topic Title",
  "readingPassage": "A rich 250-word reading passage with highlighted vocabulary words",
  "targetVocabulary": ["term 1", "term 2", "term 3", "term 4", "term 5"],
  "comprehensionQuestions": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ],
  "classroomDiscussionTopic": "Thought-provoking discussion topic for student pairs"
}`;

  try {
    const aiResponse = await callGeminiApi(prompt, 'You are an educational reading curriculum developer.', true, req);
    const parsed = parseAiJson(aiResponse);
    res.status(200).json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
