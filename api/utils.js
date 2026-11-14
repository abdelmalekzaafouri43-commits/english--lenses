const fs = require('fs');
const path = require('path');

let inMemoryApiKey = null;

function applyCors(req, res) {
  const origin = req.headers && req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-gemini-key');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

function normalizeMimeType(mimeType = '', fileName = '') {
  let clean = String(mimeType || '').split(';')[0].trim().toLowerCase();
  if (clean === 'image/jpg' || clean === 'image/pjpeg') {
    clean = 'image/jpeg';
  }
  if (!clean || clean === 'application/octet-stream') {
    const ext = path.extname(String(fileName || '')).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') clean = 'image/jpeg';
    else if (ext === '.png') clean = 'image/png';
    else if (ext === '.webp') clean = 'image/webp';
    else if (ext === '.pdf') clean = 'application/pdf';
    else if (ext === '.docx') clean = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return clean;
}

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
    throw new Error('GEMINI_API_KEY is not configured in server environment variables.');
  }

  const parts = [{ text: prompt }];

  if (fileData) {
    const cleanBase64 = String(fileData.base64 || '').replace(/^data:[^;]+;base64,/i, '');
    parts.push({
      inlineData: {
        mimeType: normalizeMimeType(fileData.mimeType),
        data: cleanBase64
      }
    });
  }

  const requestBody = {
    contents: [{ parts: parts }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 3072,
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  if (jsonOutput) {
    requestBody.generationConfig.responseMimeType = "application/json";
  }

  const candidateModels = [...new Set([
    process.env.GEMINI_MODEL,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ].filter(Boolean))];

  let lastError = null;

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error ? data.error.message : `Gemini API returned status ${response.status}`;
        lastError = new Error(msg);
        if (response.status === 404 || /not found|not supported|deprecated/i.test(msg)) {
          continue;
        }
        throw lastError;
      }

      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        throw new Error('Gemini API returned an empty response.');
      }

      return data.candidates[0].content.parts.map(p => p.text || '').join('');
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Gemini API request timed out.');
      }
      lastError = err;
      if (err === lastError && /not found|not supported|deprecated/i.test(err.message || '')) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Gemini API request failed.');
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

module.exports = { getGeminiApiKey, callGeminiApi, parseAiJson, applyCors, normalizeMimeType };
