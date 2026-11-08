const { callGeminiApi, parseAiJson } = require('../utils.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { title, topic, level, grammar, vocabulary, lessonContent } = req.body;

  const prompt = `
Create a comprehensive, printable educational English worksheet for:
Title: ${title || 'English Practice'}
Topic: ${topic || 'Conversation'}
Level: ${level || 'Intermediate (B1)'}
Grammar Target: ${grammar || 'Target pattern'}
Vocabulary: ${vocabulary || 'key terms'}
Context: ${lessonContent || ''}

Respond with a JSON object matching this schema:
{
  "vocabularyMatching": [
    { "term": "string", "definition": "string", "letter": "A" }
  ],
  "clozeExercises": [
    { "sentence": "Complete this sentence with (verb)", "targetWord": "correct answer" }
  ],
  "readingScenario": {
    "title": "string",
    "passage": "200-word engaging pedagogical reading story in English suited for this level",
    "criticalThinkingQuestion": "string"
  },
  "speakingPrompt": "Pair discussion prompt for practice"
}`;

  try {
    const aiResponse = await callGeminiApi(prompt, 'You are a professional ESL/EFL materials writer creating pedagogical student worksheets.', true, req);
    const parsed = parseAiJson(aiResponse);
    res.status(200).json({ success: true, data: parsed });
  } catch (err) {
    console.error('Error generating worksheet:', err.message);
    res.status(500).json({ error: err.message });
  }
};
