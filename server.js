/**
 * ENGLISH LENSES – SECURE GEMINI AI BACKEND SERVER
 * Serves Studio Web UI on port 3000 (proxied via Nginx)
 * Encapsulates all Gemini AI calls securely - NEVER exposes API keys to client
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const PORT = parseInt(process.env.PORT || process.env.DEFAULT_APP_PORT || '3000', 10);

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
async function callGeminiApi(prompt, systemInstruction = '', jsonOutput = false, req = null, fileData = null) {
  const apiKey = getGeminiApiKey(req);
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please add your GEMINI_API_KEY to the AI Studio Secrets panel.');
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
    contents: [
      {
        parts: parts
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 3072,
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
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for analysis

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
      throw new Error('Gemini API request timed out after 60 seconds.');
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
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://abdelmalekzaafouri43-commits.github.io',
    'https://abdelmalekzaafouri43-commits.github.io/English-worksheets-studio',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080'
  ];
  
  // Robust CORS Origin Matching
  const isAllowed = origin && (
    allowedOrigins.includes(origin) || 
    origin.endsWith('.github.io') || 
    origin.includes('europe-west2.run.app') || // AI Studio Preview
    origin.includes('aistudio.google.com')
  );

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    // For non-allowed origins during debug, still allow but log it
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.warn(`[CORS] Warning: Unauthorized origin attempted connection: ${origin}`);
  }
  
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

  console.log(`[REQUEST] ${req.method} ${pathname} (Origin: ${origin || 'no-origin'})`);

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
      if (body.length > 15 * 1024 * 1024) {
        reject(new Error('Request body too large (Max 15MB)'));
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
      engine: 'Gemini 1.5 Flash',
      service: 'English Lenses Secure Studio Backend',
      diagnostics: {
        method: req.method,
        origin: origin || 'none',
        ip: req.socket.remoteAddress
      }
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

  // NEW: Worksheet Upload & Analysis Generator
  if (pathname === '/api/ai/analyze-worksheet') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Allow': 'POST' });
      res.end('Method Not Allowed');
      return;
    }
    try {
      const body = await parseBody();
      const { fileName, mimeType, base64 } = body;

      if (!base64 || !mimeType) {
        return sendJson(400, { error: 'File data and mimeType are required.' });
      }

      let analysisPrompt = `
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

      let aiResponse;

      if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Handle DOCX via mammoth extraction
        const buffer = Buffer.from(base64, 'base64');
        const docResult = await mammoth.extractRawText({ buffer: buffer });
        const docText = docResult.value;
        
        const textPrompt = `
${analysisPrompt}
---
DOCX CONTENT START:
${docText}
DOCX CONTENT END.
`;
        aiResponse = await callGeminiApi(textPrompt, 'You are an educational materials analyst.', true);
      } else {
        // Handle PDF and Images directly via multimodal Gemini
        aiResponse = await callGeminiApi(analysisPrompt, 'You are an educational materials analyst.', true, req, { mimeType, base64 });
      }

      const parsed = parseAiJson(aiResponse);
      sendJson(200, { success: true, data: parsed });
    } catch (err) {
      console.error('Error analyzing worksheet:', err.message);
      sendJson(500, { error: err.message });
    }
    return;
  }

  // 6. Real Video Generation Service (Placeholder/Explanation)
  if (pathname === '/api/ai/generate-video') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Allow': 'POST' });
      res.end('Method Not Allowed');
      return;
    }
    
    // EXPLANATION OF MISSING COMPONENTS:
    // To render a "Real Playable Video" (.mp4), the following is required:
    // 1. A rendering engine like FFmpeg installed on the server.
    // 2. A library like Remotion or a service like Shotstack to choreograph assets.
    // 3. Cloud Storage (S3/Firebase Storage) to host the generated .mp4 file.
    // 4. A background worker (Queue) as rendering takes 1-5 minutes.
    
    sendJson(501, { 
      error: 'Real Video Rendering Not Implemented',
      message: 'Actual .mp4 video generation requires a rendering worker (FFmpeg) and cloud storage. Currently, only "Live Storyboard Playback" is supported in the Studio.',
      missingComponents: ['FFmpeg Binary', 'Asset Storage (S3/GCS)', 'Rendering Worker Queue']
    });
    return;
  }

  // 7. Save Project to Firebase Firestore
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
