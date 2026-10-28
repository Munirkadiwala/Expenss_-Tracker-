const router = require('express').Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');

router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const budget = await Budget.findOne({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
    res.json(budget || { amount: 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, month: now.getMonth() + 1, year: now.getFullYear() },
      { amount: req.body.amount },
      { upsert: true, new: true }
    );
    res.json(budget);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
