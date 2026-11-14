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
Act as an expert English language educator and animated ESL video director (in the style of English Easy Practice).
Create a structured 4-part animated educational video storyboard for:
Title: ${title}
Topic: ${topic}
Level: ${level || 'Intermediate (B1)'}
Duration: ${durationMinutes || 3} min
Grammar Target: ${grammar || 'Sentence Structure'}
Vocabulary Focus: ${vocabulary || 'Core expressions'}
Objectives: ${objectives || 'Master communicative English'}
Content Notes: ${contentNotes || ''}

Structure the 4 scenes in order:
1. "listening" (Part 1: Natural conversation between two characters — Teacher/Host Alex and Partner Maya — in an everyday setting like "Cozy Cafe", "Modern Classroom", "Glass Office", or "Sunny Park"). Include a "dialogue" array of 3-4 short alternating lines.
2. "vocabulary" (Part 2: Vocabulary Breakdown where the teacher walks up beside an animated board to explain 2-3 key words/idioms from the conversation). Include a "vocabCards" array.
3. "speaking" (Part 3: Listen & Answer Speaking Practice where the teacher asks 1-2 engaging questions and leaves a pause prompt for the learner to speak out loud). Include "pausePrompt".
4. "shadowing" (Part 4: Shadowing / Repeat Practice with short natural sentences for the learner to repeat line-by-line). Include "shadowLine".

Respond with a JSON object in this exact schema:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneType": "listening",
      "title": "Part 1: Listening Conversation",
      "environment": "Cozy Cafe",
      "visualPrompt": "Alex and Maya conversing across a warm sunlit cafe while practicing natural English",
      "narration": "Full combined conversation script for subtitles",
      "dialogue": [
        { "speaker": "Alex", "side": "left", "text": "Line 1 spoken by Alex" },
        { "speaker": "Maya", "side": "right", "text": "Line 2 reply by Maya" },
        { "speaker": "Alex", "side": "left", "text": "Line 3 spoken by Alex" }
      ],
      "characterAction": "Alex walks to left side and gestures warmly while conversing with Maya",
      "cameraAngle": "Wide Two-Shot",
      "durationSeconds": 18
    },
    {
      "sceneNumber": 2,
      "sceneType": "vocabulary",
      "title": "Part 2: Vocabulary Breakdown",
      "environment": "Modern Classroom",
      "visualPrompt": "Teacher stands beside animated vocabulary cards highlighting definitions and examples",
      "narration": "Let's learn the key expressions from our conversation and see how to use them naturally.",
      "vocabCards": [
        { "word": "expression 1", "definition": "Simple clear meaning", "example": "Short natural example sentence." },
        { "word": "expression 2", "definition": "Simple clear meaning", "example": "Short natural example sentence." }
      ],
      "characterAction": "Teacher walks toward center-left and points to glowing vocabulary cards",
      "cameraAngle": "Medium Shot",
      "durationSeconds": 20
    },
    {
      "sceneNumber": 3,
      "sceneType": "speaking",
      "title": "Part 3: Listen & Answer Speaking Practice",
      "environment": "Modern Classroom",
      "visualPrompt": "Teacher steps forward encouraging the learner to answer out loud during the pause timer",
      "narration": "Now it is your turn! Listen to the question and speak your answer out loud.",
      "pausePrompt": "How would you respond politely in this situation?",
      "characterAction": "Teacher steps closer to camera with encouraging smile and listening gesture",
      "cameraAngle": "Medium Close-Up",
      "durationSeconds": 16
    },
    {
      "sceneNumber": 4,
      "sceneType": "shadowing",
      "title": "Part 4: Shadowing & Pronunciation",
      "environment": "Modern Classroom",
      "visualPrompt": "Line-by-line repeat prompt with highlighted rhythm subtitles",
      "narration": "Listen closely and repeat each sentence right after me to build fluency.",
      "shadowLine": "Repeat this key target sentence naturally with clear rhythm.",
      "characterAction": "Teacher nods rhythmically while guiding pronunciation",
      "cameraAngle": "Close-Up",
      "durationSeconds": 16
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
