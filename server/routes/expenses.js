const router = require('express').Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

router.get('/', auth, async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { user: req.user.id };
    if (category && category !== 'All') filter.category = category;
    if (search) filter.description = { $regex: search, $options: 'i' };
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user.id });
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, req.body, { new: true }
    );
    res.json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
