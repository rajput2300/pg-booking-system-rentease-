const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pg:      { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  // Sub-ratings (optional but shown as breakdown)
  subRatings: {
    cleanliness: { type: Number, min: 1, max: 5 },
    food:        { type: Number, min: 1, max: 5 },
    location:    { type: Number, min: 1, max: 5 },
    safety:      { type: Number, min: 1, max: 5 }
  }
}, { timestamps: true });

// Prevent duplicate reviews from same user on same PG
reviewSchema.index({ user: 1, pg: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
