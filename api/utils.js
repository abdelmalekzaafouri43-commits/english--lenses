const fs = require('fs');
const path = require('path');

let inMemoryApiKey = null;

function getGeminiApiKey(req = null) {
  if (inMemoryApiKey && inMemoryApiKey !== 'MY_GEMINI_API_KEY') {
    return inMemoryApiKey;
  }
  if (req && req.headers && req.headers['x-gemini-key'] && req.headers['x-gemini-key'] !== 'MY_GEMINI_API_KEY') {
    return req.headers['x-gemini-key'];
  }

  for (const k of ['GEMINI_API_KEY', 'gemini_api_key', 'GOOGLE_API_KEY', 'google_api_key', 'GEMINI_KEY', 'AI_STUDIO_API_KEY']) {
    if (process.env[k] && process.env[k].trim() && process.env[k].trim() !== 'MY_GEMINI_API_KEY') {
      return process.env[k].trim().replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

async function callGeminiApi(prompt, systemInstruction = '', jsonOutput = false, req = null, fileData = null) {
  const apiKey = getGeminiApiKey(req);
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const parts = [{ text: prompt }];
  
  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.base64
      }
    });
  }

  const requestBody = {
    contents: [{ parts: parts }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  if (jsonOutput) {
    requestBody.generationConfig.responseMimeType = "application/json";
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ? data.error.message : `Gemini API returned status ${response.status}`);
  }

  if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
    throw new Error('Gemini API returned an empty response.');
  }

  return data.candidates[0].content.parts.map(p => p.text).join('');
}

function parseAiJson(text) {
  if (!text) throw new Error('Empty AI response');
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/, '').trim();
  }
  try {
    return JSON.parse(clean);
  } catch (e) {
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(clean.substring(firstBrace, lastBrace + 1));
    }
    throw new Error('Failed to parse JSON from AI response: ' + e.message);
  }
}

module.exports = { getGeminiApiKey, callGeminiApi, parseAiJson };
