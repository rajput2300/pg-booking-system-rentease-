const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user:
        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pg:         { type: mongoose.Schema.Types.ObjectId, ref: 'PG' },
  subject:    { type: String, required: true, trim: true },
  message:    { type: String, required: true, trim: true },
  status:     { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  adminReply: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
