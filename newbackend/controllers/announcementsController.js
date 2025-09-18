const Announcement = require('../models/Announcement');

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ groupId: req.params.groupId });
    res.json(announcements);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addAnnouncement = async (req, res) => {
  try {
    const { groupId, text } = req.body;
    const announcement = await Announcement.create({ groupId, text, userId: req.user.id });
    const io = req.app.get('io');
    io.of('/group').to(groupId).emit('updateAnnouncements', await Announcement.find({ groupId }));
    res.json(announcement);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
