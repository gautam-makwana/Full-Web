const express = require('express');
const Expense = require('../models/Expense');

const router = express.Router();

// Create expense
router.post('/', async (req, res) => {
  try {
    const { description, amount, splitAmount, userId, groupId } = req.body;
    if (!description || !amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid expense' });
    }

    const gid = groupId || 'groupRoom';
    const exp = await Expense.create({
      description,
      amount: Number(amount),
      splitAmount: typeof splitAmount === 'number' ? splitAmount : Number(amount),
      userId: userId || null,
      groupId: gid,
    });

    return res.json(exp);
  } catch (err) {
    console.error('Expenses POST error:', err);
    return res.status(500).json({ error: 'Failed to save expense' });
  }
});

// List expenses (optionally filter by groupId via query)
router.get('/', async (req, res) => {
  try {
    const groupId = req.query.groupId;
    const filter = groupId ? { groupId } : {};
    const expenses = await Expense.find(filter).sort({ createdAt: -1 });
    return res.json(expenses);
  } catch (err) {
    console.error('Expenses GET error:', err);
    return res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

module.exports = router;
