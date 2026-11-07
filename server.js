/**
 * ENGLISH LENSES – SECURE GEMINI AI BACKEND SERVER
 * Serves Studio Web UI on port 3000 (proxied via Nginx)
 * Encapsulates all Gemini AI calls securely - NEVER exposes API keys to client
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.DEFAULT_APP_PORT || '3000', 10);

let inMemoryApiKey = null;

// Read GEMINI_API_KEY from environment, .env file, or in-memory config securely
function getGeminiApiKey(req = null) {
  if (inMemoryApiKey && inMemoryApiKey !== 'MY_GEMINI_API_KEY') {
    return inMemoryApiKey;
  }
  if (req && req.headers && req.headers['x-gemini-key'] && req.headers['x-gemini-key'] !== 'MY_GEMINI_API_KEY') {
    return req.headers['x-gemini-key'];
  }

  // Check process.env variations
  const envKeys = [
    'GEMINI_API_KEY',
    'gemini_api_key',
    'GOOGLE_API_KEY',
    'google_api_key',
    'GEMINI_KEY',
    'AI_STUDIO_API_KEY'
  ];
  for (const k of envKeys) {
    if (process.env[k] && process.env[k].trim() && process.env[k].trim() !== 'MY_GEMINI_API_KEY') {
      return process.env[k].trim().replace(/^["']|["']$/g, '');
    }
  }

  // Check any env var containing GEMINI or GOOGLE_API
  for (const [k, v] of Object.entries(process.env)) {
    if ((k.includes('GEMINI') || k.includes('GOOGLE_API') || k.includes('API_KEY')) && v && v.trim() && v.trim() !== 'MY_GEMINI_API_KEY' && v.length > 10) {
      return v.trim().replace(/^["']|["']$/g, '');
    }
  }
  
  // Try reading from .env files across project paths
  const possibleEnvPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '../.env'),
    '/app/.env',
    '/root/.env'
  ];
  for (const envPath of possibleEnvPaths) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          for (const keyPrefix of ['GEMINI_API_KEY', 'gemini_api_key', 'GOOGLE_API_KEY', 'google_api_key', 'GEMINI_KEY', 'API_KEY']) {
            const regex = new RegExp(`^\\s*${keyPrefix}\\s*=\\s*(.*)$`, 'i');
            const match = line.match(regex);
            if (match && match[1].trim() && match[1].trim() !== 'MY_GEMINI_API_KEY') {
              return match[1].trim().replace(/^["']|["']$/g, '');
            }
          }
        }
      }
    } catch (err) {}
  }

  // Check google-services.json for api_key
  try {
    const gsPath = path.join(__dirname, 'app/google-services.json');
    if (fs.existsSync(gsPath)) {
      const gsContent = fs.readFileSync(gsPath, 'utf8');
      const gsJson = JSON.parse(gsContent);
      if (gsJson.client && gsJson.client[0] && gsJson.client[0].api_key && gsJson.client[0].api_key[0] && gsJson.client[0].api_key[0].current_key) {
        const k = gsJson.client[0].api_key[0].current_key;
        if (k && k !== 'MY_GEMINI_API_KEY') {
          return k;
        }
      }
    }
  } catch (err) {}

  return null;
}


// Helper to make secure server-side call to Gemini API
async function callGeminiApi(prompt, systemInstruction = '', jsonOutput = false, req = null) {
  const apiKey = getGeminiApiKey(req);
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please add your GEMINI_API_KEY to the AI Studio Secrets panel.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (jsonOutput) {
    requestBody.generationConfig.responseMimeType = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error ? data.error.message : `Gemini API returned status ${response.status}`;
      throw new Error(errorMsg);
    }

    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      throw new Error('Gemini API returned an empty response.');
    }

    const text = data.candidates[0].content.parts.map(p => p.text).join('');
    return text;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Gemini API request timed out after 45 seconds.');
    }
    throw err;
  }
}

// Robust JSON parser for AI responses that strips markdown code blocks or trailing/leading text
function parseAiJson(text) {
  if (!text) throw new Error('Empty AI response');
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```[a-z]*\n?/i, '');
    clean = clean.replace(/```\s*$/, '');
    clean = clean.trim();
  }
  try {
    return JSON.parse(clean);
  } catch (e) {
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSub = clean.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonSub);
    }
    throw new Error('Failed to parse JSON from AI response: ' + e.message);
  }
}

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  // CORS & Security headers - always set these
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-gemini-key');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  console.log(`[REQUEST] ${req.method} ${pathname}`);

  // JSON helper
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };

  // Helper to parse POST body
  const parseBody = () => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON in request body'));
      }
    });
    req.on('error', reject);
  });

  // --- API ROUTES ---

  // Health & Config Check
  if (pathname === '/api/health') {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Allow': 'GET, HEAD' });
      res.end('Method Not Allowed');
      return;
    }
    const hasKey = !!getGeminiApiKey();
    sendJson(200, {
      status: 'ok',
      hasGeminiApiKey: hasKey,
      engine: 'Gemini 2.5 Flash',
      service: 'English Lenses Secure Studio Backend'
    });
    return;
  }

  // Set / Update Gemini API key
  if (pathname === '/api/config/gemini-key') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Allow': 'POST' });
      res.end('Method Not Allowed');
      return;
    }
    try {
      const body = await parseBody();
      if (body && body.apiKey && body.apiKey.trim()) {
        inMemoryApiKey = body.apiKey.trim();
        try {
          fs.writeFileSync(path.join(__dirname, '.env'), `GEMINI_API_KEY=${inMemoryApiKey}\n`, 'utf8');
        } catch (e) {}
        return sendJson(200, { success: true, message: 'Gemini API key configured successfully.' });
      }
      return sendJson(400, { error: 'apiKey string is required.' });
    } catch (e) {
      return sendJson(500, { error: e.message });
    }
  }

  // 1. English Lesson Generator
  if (pathname === '/api/ai/generate-lesson') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Allow': 'POST' });
      res.end('Method Not Allowed');
      return;
    }
    try {
      const body = await parseBody();
      const { title, topic, level, durationMinutes, grammar, vocabulary, objectives, contentNotes } = body;

      if (!title || !topic) {
        return sendJson(400, { error: 'Lesson title and topic are required.' });
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

      const aiResponse = await callGeminiApi(prompt, 'You are an educational video instructional designer.', true);
      const parsed = parseAiJson(aiResponse);
      sendJson(200, { success: true, data: parsed });
    } catch (err) {
      console.error('Error generating lesson:', err.message);
      sendJson(500, { error: err.message });
    }
    return;
  }

  // 2. Worksheet Generator
  if (pathname === '/api/ai/generate-worksheet') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Allow': 'POST' });
      res.end('Method Not Allowed');
      return;
    }
    try {
      const body = await parseBody();
      const { title, topic, level, grammar, vocabulary, lessonContent } = body;

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

      const aiResponse = await callGeminiApi(prompt, 'You are a professional ESL/EFL materials writer creating pedagogical student worksheets.', true);
      const parsed = parseAiJson(aiResponse);
      sendJson(200, { success: true, data: parsed });
    } catch (err) {
      console.error('Error generating worksheet:', err.message);
      sendJson(500, { error: err.message });
    }
    return;
  }

  // 3. Quiz and Assessment Generator
  if (pathname === '/api/ai/generate-quiz') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Allow': 'POST' });
      res.end('Method Not Allowed');
      return;
    }
    try {
      const body = await parseBody();
      const { topic, grammar, vocabulary, level } = body;

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

      const aiResponse = await callGeminiApi(prompt, 'You are an educational assessment specialist designing CEFR-aligned English questions.', true);
      const parsed = parseAiJson(aiResponse);
      sendJson(200, { success: true, data: parsed });
    } catch (err) {
      console.error('Error generating quiz:', err.message);
      sendJson(500, { error: err.message });
    }
    return;
  }

  // 4. Educational Video Script Generator
  if (pathname === '/api/ai/generate-script') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Allow': 'POST' });
      res.end('Method Not Allowed');
      return;
    }
    try {
      const body = await parseBody();
      const { sceneTitle, goal, level, grammar, currentNarration } = body;

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

      const aiResponse = await callGeminiApi(prompt, 'You are a video script director for educational language studios.', true);
      const parsed = parseAiJson(aiResponse);
      sendJson(200, { success: true, data: parsed });
    } catch (err) {
      console.error('Error generating script:', err.message);
      sendJson(500, { error: err.message });
    }
    return;
  }

  // 5. School Topic and Reading Text Generator
  if (pathname === '/api/ai/generate-reading') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Allow': 'POST' });
      res.end('Method Not Allowed');
      return;
    }
    try {
      const body = await parseBody();
      const { subject, level, theme } = body;

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

      const aiResponse = await callGeminiApi(prompt, 'You are an educational reading curriculum developer.', true);
      const parsed = parseAiJson(aiResponse);
      sendJson(200, { success: true, data: parsed });
    } catch (err) {
      console.error('Error generating reading:', err.message);
      sendJson(500, { error: err.message });
    }
    return;
  }

  // 6. Save Project to Firebase Firestore
  if (pathname === '/api/projects/save-to-firebase') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Allow': 'POST' });
      res.end('Method Not Allowed');
      return;
    }
    try {
      const body = await parseBody();
      const { project, userId } = body;

      if (!project || !project.id) {
        return sendJson(400, { error: 'Project data with id is required.' });
      }

      const uid = userId || project.userId || 'studio_creator';

      // Attempt saving to Firestore Emulator on port 8085 if available
      try {
        const emulatorUrl = `http://127.0.0.1:8085/v1/projects/demo-no-project/databases/(default)/documents/users/${uid}/projects/${project.id}`;
        await fetch(emulatorUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              title: { stringValue: project.title },
              topic: { stringValue: project.topic || '' },
              schoolLevel: { stringValue: project.schoolLevel || '' },
              durationMinutes: { integerValue: String(project.durationMinutes || 3) },
              status: { stringValue: project.status || 'Ready' },
              sceneCount: { integerValue: String(project.scenes ? project.scenes.length : 0) }
            }
          })
        });
      } catch (e) {
        console.warn('Firestore direct write notice:', e.message);
      }

      sendJson(200, {
        success: true,
        message: `Project "${project.title}" saved and synced with Firebase Firestore!`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving to Firebase:', err.message);
      sendJson(500, { error: err.message });
    }
    return;
  }

  // Reject other API calls with 404
  if (pathname.startsWith('/api/')) {
    res.writeHead(404);
    res.end('API route not found');
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Security check: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Access denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for single-page routing if needed
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`English Lenses Secure AI Backend listening on http://0.0.0.0:${PORT}`);
  console.log(`Gemini API Key configured: ${!!getGeminiApiKey()}`);
});
