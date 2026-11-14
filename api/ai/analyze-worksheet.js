const { callGeminiApi, parseAiJson, applyCors, normalizeMimeType } = require('../utils.js');
const mammoth = require('mammoth');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fileName, mimeType: rawMimeType, base64: rawBase64 } = req.body || {};
  const mimeType = normalizeMimeType(rawMimeType, fileName);
  const base64 = typeof rawBase64 === 'string' ? rawBase64.replace(/^data:[^;]+;base64,/i, '') : '';

  if (!base64 || !mimeType) {
    return res.status(400).json({ error: 'File data and mimeType are required.' });
  }

  const analysisPrompt = `
You are an expert English language materials analyst.
Analyze the attached worksheet and extract its pedagogical structure.
Identify the topic, target learner level (CEFR), grammar focus, and key vocabulary.
Extract any reading passages or main instructional text.
Identify if there are questions or exercises.
IMPORTANT: If sections are unreadable or unclear, report them in the "unclearSections" field instead of inventing content.

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
      const docResult = await mammoth.extractRawText({ buffer });
      const docText = (docResult && docResult.value ? docResult.value : '').trim();
      if (!docText) {
        return res.status(400).json({ error: 'Could not extract readable text from the DOCX file.' });
      }
      aiResponse = await callGeminiApi(`${analysisPrompt}\n---\nDOCX CONTENT:\n${docText}`, 'You are an educational materials analyst.', true, req);
    } else {
      aiResponse = await callGeminiApi(analysisPrompt, 'You are an educational materials analyst.', true, req, { mimeType, base64 });
    }
    res.status(200).json({ success: true, data: parseAiJson(aiResponse) });
  } catch (err) {
    console.error('Analyze worksheet error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
