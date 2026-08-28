const { getProfileSummary } = require('../../lib/githubService');                                     

module.exports = async function handler(req, res) {
  const { username } = req.query;

  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username || '')) {
    return res.status(400).json({ message: 'Invalid GitHub username format' });
  }

  try {
    const profile = await getProfileSummary(username);
    return res.status(200).json(profile);
  } catch (err) {
    const status = err.status || 500;
    const message =
      status === 404 ? `No GitHub user found for "${username}"` : 'Failed to fetch profile data';
    return res.status(status).json({ message });
  }
};
