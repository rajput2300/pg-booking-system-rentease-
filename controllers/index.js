const User = require('../models/User.js');
const PG = require('../models/PG.js');
const Complaint = require('../models/Complaint');

module.exports.index = async (req, res, next) => {
    const featured = await PG.find({ featured: true, status: 'active' }).limit(6);
    const cities = await PG.distinct('city');
    res.render('index', { title: 'RentEase.in - Find Your Perfect PG', featured, cities });
};

module.exports.aboutsection = (req, res) => {
  res.render('about', { title: 'About - RentEase.in' });
};

module.exports.contacsection = (req, res) => {
  res.render('contact', { title: 'Contact - RentEase.in' });
};

module.exports.complaintSection = async (req, res, next) => {
    const { subject, message, pgId } = req.body;
    await Complaint.create({
      user: req.session.user._id,
      pg: pgId || null,
      subject,
      message
    });
    req.flash('success', 'Your complaint/query has been submitted. We will get back to you soon!');
    res.redirect('/contact');
};

module.exports.wishListToggle = async (req, res, next) => {
    const { pgId } = req.body;
    const user = await User.findById(req.session.user._id);
    const idx = user.wishlist.indexOf(pgId);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
      await user.save();
      return res.json({ saved: false, message: 'Removed from wishlist' });
    } else {
      user.wishlist.addToSet(pgId);
      await user.save();
      return res.json({ saved: true, message: 'Saved to wishlist' });
    }
};

module.exports.getUserDashboard = async (req, res, next) => {
    const Booking = require('../models/Booking');
    const Review = require('../models/Review');

    const user = await User.findById(req.session.user._id).populate('wishlist');
    const bookings = await Booking.find({ user: req.session.user._id }).populate('pg', 'title city images price').sort({ createdAt: -1 }).limit(5);
    const reviews = await Review.find({ user: req.session.user._id }).populate('pg', 'title city').sort({ createdAt: -1 });
    const complaints = await Complaint.find({ user: req.session.user._id }).sort({ createdAt: -1 });

    const stats = {
      totalBookings: await Booking.countDocuments({ user: req.session.user._id }),
      activeBookings: await Booking.countDocuments({ user: req.session.user._id, status: 'approved' }),
      totalReviews: reviews.length,
      wishlistCount: user.wishlist.length
    };

    res.render('user/dashboard', {
      title: 'My Dashboard - RentEase.in',
      user, bookings, reviews, complaints, stats,
      wishlist: user.wishlist
    });
};