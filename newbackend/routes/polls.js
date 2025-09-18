const express = require('express');
const Poll = require('../models/Poll');

const router = express.Router();

// Create poll
router.post('/', async (req, res) => {
  try {
    const { question, options, userId, groupId } = req.body;
    if (!question || !question.trim() || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Invalid poll' });
    }

    const gid = groupId || 'groupRoom';
    // normalize options to objects with votes
    const opts = options.map((o) => ({ text: String(o).trim(), votes: 0 }));
    const poll = await Poll.create({ question: question.trim(), options: opts, userId: userId || null, groupId: gid });
    return res.json(poll);
  } catch (err) {
    console.error('Polls POST error:', err);
    return res.status(500).json({ error: 'Failed to save poll' });
  }
});

// Vote
router.post('/vote/:id', async (req, res) => {
  try {
    const { optionIndex, userId } = req.body;
    if (optionIndex == null) return res.status(400).json({ error: 'optionIndex required' });

    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    const voterId = userId || null;
    if (voterId && poll.voters.includes(voterId)) {
      return res.status(400).json({ error: 'User already voted' });
    }

    // ensure optionIndex valid
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid optionIndex' });
    }

    poll.options[optionIndex].votes = (poll.options[optionIndex].votes || 0) + 1;
    if (voterId) poll.voters.push(voterId);
    await poll.save();
    return res.json(poll);
  } catch (err) {
    console.error('Polls vote error:', err);
    return res.status(500).json({ error: 'Failed to vote' });
  }
});

// List polls (optionally filter by groupId)
router.get('/', async (req, res) => {
  try {
    const groupId = req.query.groupId;
    const filter = groupId ? { groupId } : {};
    const polls = await Poll.find(filter).sort({ createdAt: -1 });
    return res.json(polls);
  } catch (err) {
    console.error('Polls GET error:', err);
    return res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

module.exports = router;
