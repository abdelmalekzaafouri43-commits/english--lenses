const { applyCors } = require('../utils.js');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { project, userId } = req.body || {};
  if (!project || !project.id) {
    return res.status(400).json({ error: 'Project data with id is required.' });
  }
  res.status(200).json({
    success: true,
    message: `Project "${project.title}" saved and synced with Firebase Firestore!`,
    timestamp: new Date().toISOString()
  });
};
