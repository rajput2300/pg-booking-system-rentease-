const Review = require('../models/Review');
const PG = require('../models/PG');

module.exports.postReview = async (req, res, next) => {

  const { pgId, rating, comment, cleanliness, food, location: locRating, safety } = req.body;

  const exists = await Review.findOne({ user: req.session.user._id, pg: pgId });
  if (exists) {
    req.flash('error', 'You have already reviewed this PG.');
    return res.redirect('/pgs/' + pgId);
  }

  const subRatings = {};
  if (cleanliness) subRatings.cleanliness = Number(cleanliness);
  if (food) subRatings.food = Number(food);
  if (locRating) subRatings.location = Number(locRating);
  if (safety) subRatings.safety = Number(safety);

  await Review.create({
    user: req.session.user._id,
    pg: pgId,
    rating: Number(rating),
    comment,
    subRatings
  });

  // Recalculate PG average rating
  const reviews = await Review.find({ pg: pgId });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await PG.findByIdAndUpdate(pgId, { rating: parseFloat(avg.toFixed(1)), reviewCount: reviews.length });

  req.flash('success', 'Review submitted! Thank you for your feedback.');
  res.redirect('/pgs/' + pgId);
};


module.exports.destroyReview = async (req, res, next) => {

  const review = await Review.findById(req.params.id);
  if (!review) { req.flash('error', 'Review not found.'); return res.redirect('back'); }
  const pgId = review.pg;
  if (review.user.toString() !== req.session.user._id.toString() && req.session.user.role !== 'admin') {
    req.flash('error', 'Not authorized.');
    return res.redirect('back');
  }
  await review.deleteOne();
  const reviews = await Review.find({ pg: pgId });
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  await PG.findByIdAndUpdate(pgId, { rating: parseFloat(avg.toFixed(1)), reviewCount: reviews.length });
  req.flash('success', 'Review deleted.');
  res.redirect('back');
};