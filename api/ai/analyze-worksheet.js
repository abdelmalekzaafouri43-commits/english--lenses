const { callGeminiApi, parseAiJson } = require('../utils.js');
const mammoth = require('mammoth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { mimeType, base64 } = req.body;

  if (!base64 || !mimeType) {
    return res.status(400).json({ error: 'File data and mimeType are required.' });
  }

  const analysisPrompt = `
You are an expert English language materials analyst.
Analyze the attached worksheet and extract its pedagogical structure.
Respond with a JSON object strictly matching this schema:
{
  "title": "Extracted or inferred title",
  "topic": "Core subject topic",
  "level": "CEFR Level (e.g. B1)",
  "grammar": "Target grammar structures identified",
  "vocabulary": ["word1", "word2", "word3"],
  "passage": "Full reading passage or main educational text extracted",
  "hasQuestions": true,
  "hasVocabularyDrills": true,
  "unclearSections": "Description of any parts that couldn't be parsed or 'None'"
}`;

  try {
    let aiResponse;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const buffer = Buffer.from(base64, 'base64');
      const docResult = await mammoth.extractRawText({ buffer: buffer });
      const docText = docResult.value;
      aiResponse = await callGeminiApi(`${analysisPrompt}\n---\nDOCX CONTENT:\n${docText}`, 'You are an educational materials analyst.', true, req);
    } else {
      aiResponse = await callGeminiApi(analysisPrompt, 'You are an educational materials analyst.', true, req, { mimeType, base64 });
    }
    res.status(200).json({ success: true, data: parseAiJson(aiResponse) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
