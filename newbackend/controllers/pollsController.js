const Poll = require('../models/Poll');

exports.getPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ groupId: req.params.groupId });
    res.json(polls);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createPoll = async (req, res) => {
  try {
    const { groupId, question, options } = req.body;
    const poll = await Poll.create({ groupId, question, options, votes: new Array(options.length).fill(0), userId: req.user.id });
    const io = req.app.get('io');
    io.of('/group').to(groupId).emit('updatePolls', await Poll.find({ groupId }));
    res.json(poll);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.votePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    const { optionIndex } = req.body;
    poll.votes[optionIndex] += 1;
    await poll.save();
    const io = req.app.get('io');
    io.of('/group').to(poll.groupId).emit('updatePolls', await Poll.find({ groupId: poll.groupId }));
    res.json(poll);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
