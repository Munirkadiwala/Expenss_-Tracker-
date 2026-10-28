const router = require('express').Router();
const auth = require('../middleware/auth');
const Income = require('../models/Income');

router.get('/', auth, async (req, res) => {
  try {
    const { search, source } = req.query;
    const filter = { user: req.user.id };
    if (source && source !== 'All') filter.source = source;
    if (search) filter.description = { $regex: search, $options: 'i' };
    const income = await Income.find(filter).sort({ date: -1 });
    res.json(income);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const income = await Income.create({ ...req.body, user: req.user.id });
    res.status(201).json(income);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, req.body, { new: true }
    );
    res.json(income);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Income.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
