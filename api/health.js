const { getGeminiApiKey } = require('../utils');

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const hasKey = !!getGeminiApiKey();
  res.status(200).json({
    status: 'ok',
    hasGeminiApiKey: hasKey,
    engine: 'Gemini 1.5 Flash',
    service: 'English Lenses Secure Studio Backend',
    diagnostics: {
      method: req.method,
      origin: req.headers.origin || 'none'
    }
  });
};
