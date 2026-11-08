const { callGeminiApi, parseAiJson } = require('../utils.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { title, topic, level, durationMinutes, grammar, vocabulary, objectives, contentNotes } = req.body;

  if (!title || !topic) {
    return res.status(400).json({ error: 'Lesson title and topic are required.' });
  }

  const prompt = `
Act as an expert English language educator and educational video director.
Create a structured 3-scene educational video storyboard for:
Title: ${title}
Topic: ${topic}
Level: ${level || 'Intermediate (B1)'}
Duration: ${durationMinutes || 3} min
Grammar Target: ${grammar || 'Sentence Structure'}
Vocabulary Focus: ${vocabulary || 'Core expressions'}
Objectives: ${objectives || 'Master communicative English'}
Content Notes: ${contentNotes || ''}

Respond with a JSON object in this exact schema:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Hook & Scenario Introduction",
      "visualPrompt": "Detailed 3D staging prompt with virtual studio cues and environment",
      "narration": "Exact spoken teacher narration dialogue for students",
      "characterAction": "Specific 3D avatar gesture and motion",
      "cameraAngle": "Medium Shot",
      "durationSeconds": 18
    },
    {
      "sceneNumber": 2,
      "title": "Grammar & Concept Spotlight",
      "visualPrompt": "Detailed 3D staging prompt showing animated syntax formula",
      "narration": "Exact spoken teacher narration explaining grammar breakdown",
      "characterAction": "Pointing and highlighting 3D text cards",
      "cameraAngle": "Medium Close-Up",
      "durationSeconds": 24
    },
    {
      "sceneNumber": 3,
      "title": "Interactive Practice Challenge",
      "visualPrompt": "Detailed 3D staging prompt with interactive quiz board",
      "narration": "Exact spoken teacher narration guiding student response",
      "characterAction": "Listening pose and encouraging gesture",
      "cameraAngle": "Wide Two-Shot",
      "durationSeconds": 20
    }
  ],
  "pedagogicalSummary": "Short 2-sentence summary of the lesson's communicative strategy"
}`;

  try {
    const aiResponse = await callGeminiApi(prompt, 'You are an educational video instructional designer.', true, req);
    const parsed = parseAiJson(aiResponse);
    res.status(200).json({ success: true, data: parsed });
  } catch (err) {
    console.error('Error generating lesson:', err.message);
    res.status(500).json({ error: err.message });
  }
};
