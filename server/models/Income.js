const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
