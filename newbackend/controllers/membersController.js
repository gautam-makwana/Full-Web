const Member = require('../models/Member');

exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find({ groupId: req.params.groupId });
    res.json(members);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addMembers = async (req, res) => {
  try {
    const { groupId, members } = req.body; // members: [{name, role}]
    const createdMembers = await Member.insertMany(
      members.map(m => ({ ...m, groupId, userId: req.user.id }))
    );
    const io = req.app.get('io');
    io.of('/group').to(groupId).emit('updateMembers', createdMembers);
    res.json(createdMembers);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
