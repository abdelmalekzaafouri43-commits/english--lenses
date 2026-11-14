const { callGeminiApi, parseAiJson, applyCors } = require('../utils.js');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { sceneTitle, goal, level, grammar, currentNarration } = req.body || {};

  const prompt = `
You are an expert English teacher voice coach and video director.
Enhance and write the spoken narration dialogue and 3D visual staging for this educational video scene:
Scene Title: ${sceneTitle || 'Lesson Scene'}
Teaching Goal: ${goal || 'Enhance conversational fluency'}
Target Level: ${level || 'Intermediate (B1)'}
Grammar: ${grammar || 'English sentence structure'}
Existing Narration: "${currentNarration || ''}"

Respond with a JSON object:
{
  "polishedNarration": "Exact refined teacher script to be spoken clearly on camera",
  "visualPrompt": "Updated 3D camera staging, virtual board visual cues, and studio environment",
  "characterAction": "Avatar motion instruction (e.g. gesture, smile, pointing at virtual board)",
  "cameraAngle": "Medium Close-Up"
}`;

  try {
    const aiResponse = await callGeminiApi(prompt, 'You are a video script director for educational language studios.', true, req);
    const parsed = parseAiJson(aiResponse);
    res.status(200).json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
