const Booking = require('../models/Booking');
const PG = require('../models/PG');
const User = require('../models/User');

module.exports.getMyBookingPage = async (req, res, next) => {
    const bookings = await Booking.find({ user: req.session.user._id }).populate('pg').sort({ createdAt: -1 });
    res.render('user/my-bookings', { title: 'My Bookings - RentEase.in', bookings });
};

module.exports.wishlist = async (req, res, next) => {
    const user = await User.findById(req.session.user._id).populate('wishlist');
    res.render('user/wishlist', { title: 'My Wishlist - RentEase.in', wishlist: user.wishlist || [] });
};

module.exports.toggleWishList = async (req, res, next) => {

    const user = await User.findById(req.session.user._id);
    const pgId = req.params.pgId;
    const idx = user.wishlist.findIndex(id => id.toString() === pgId);
    if (idx > -1) {
      // Remove from wishlist
      user.wishlist.splice(idx, 1);
      await user.save();
      req.flash('success', 'Removed from wishlist.');
    } else {
      // Add to wishlist (prevent duplicates)
      user.wishlist.push(pgId);
      await user.save();
      req.flash('success', 'Added to wishlist! ❤️');
    }
    res.redirect('back');
};

module.exports.bookPG = async (req, res, next) => {
    const { pgId, checkIn, duration, message } = req.body;
    const pg = await PG.findById(pgId);
    if (!pg) { req.flash('error', 'PG not found.'); return res.redirect('/pgs'); }
    if (pg.availableRooms < 1) {
      req.flash('error', 'No rooms available at this time.');
      return res.redirect('/pgs/' + pgId);
    }
    // Check for existing active booking
    const existingBooking = await Booking.findOne({
      user: req.session.user._id,
      pg: pgId,
      status: { $in: ['pending', 'approved'] }
    });
    if (existingBooking) {
      req.flash('error', 'You already have an active booking for this PG.');
      return res.redirect('/pgs/' + pgId);
    }
    const totalAmount = pg.price * (Number(duration) || 1);
    await Booking.create({
      user: req.session.user._id,
      pg: pgId,
      checkIn: new Date(checkIn),
      duration: Number(duration) || 1,
      totalAmount,
      message
    });
    req.flash('success', 'Booking request submitted! We will confirm shortly.');
    res.redirect('/bookings/my');
  if(err) {
    req.flash('error', 'Booking failed. Please try again.');
    res.redirect('/pgs/' + req.body.pgId);
  }
};

module.exports.cancleBooking = async (req, res, next) => {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.session.user._id });
    if (!booking) { req.flash('error', 'Booking not found.'); return res.redirect('/bookings/my'); }
    if (booking.status === 'approved') {
      req.flash('error', 'Cannot cancel an approved booking. Please contact support.');
      return res.redirect('/bookings/my');
    }
    booking.status = 'cancelled';
    await booking.save();
    req.flash('success', 'Booking cancelled successfully.');
    res.redirect('/bookings/my');
};