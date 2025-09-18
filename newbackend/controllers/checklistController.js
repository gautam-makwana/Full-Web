const Checklist = require('../models/Checklist');

exports.getChecklist = async (req, res) => {
  try {
    const checklist = await Checklist.find({ groupId: req.params.groupId });
    res.json(checklist);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addTask = async (req, res) => {
  try {
    const { groupId, text } = req.body;
    const task = await Checklist.create({ text, groupId, userId: req.user.id });
    const io = req.app.get('io');
    io.of('/group').to(groupId).emit('updateChecklist', await Checklist.find({ groupId }));
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleTask = async (req, res) => {
  try {
    const task = await Checklist.findById(req.params.id);
    task.done = !task.done;
    await task.save();
    const io = req.app.get('io');
    io.of('/group').to(task.groupId).emit('updateChecklist', await Checklist.find({ groupId: task.groupId }));
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
