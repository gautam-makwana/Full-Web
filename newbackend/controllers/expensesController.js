const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId });
    res.json(expenses);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addExpense = async (req, res) => {
  try {
    const { groupId, description, amount, members } = req.body;
    const splitAmount = amount / members.length;
    const expense = await Expense.create({
      description, amount, splitAmount, members: members.map(name => ({ name, paid: false })),
      groupId, userId: req.user.id
    });
    const io = req.app.get('io');
    io.of('/group').to(groupId).emit('updateExpenses', await Expense.find({ groupId }));
    res.json(expense);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
