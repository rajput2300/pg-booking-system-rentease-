const PG = require('../models/PG');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { isLoggedIn } = require('../middleware/auth');
const opencage = require('opencage-api-client');

module.exports.pgWithSearchAndFilter = async (req, res, next) => {
    const { search, minPrice, maxPrice, gender, amenities, sort } = req.query;
    let query = { status: 'active' };

    if (search) {
      query.$or = [
        { city: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { title: new RegExp(search, 'i') }
      ];
    }
    if (gender) query.gender = gender;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (amenities) {
      const arr = Array.isArray(amenities) ? amenities : [amenities];
      query.amenities = { $all: arr };
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'rating') sortObj = { rating: -1 };

    const pgs = await PG.find(query).sort(sortObj);
    const cities = await PG.distinct('city');
    res.render('user/listings', { title: 'Find PG - RentEase.in', pgs, cities, query: req.query });
};

module.exports.getPgDetails = async (req, res, next) => {

    const pg = await PG.findById(req.params.id).populate('owner', 'username email phone');
    if (!pg) { req.flash('error', 'PG not found.'); return res.redirect('/pgs'); }

    const reviews = await Review.find({ pg: pg._id }).populate('user', 'username').sort({ createdAt: -1 });

    let userBooking = null;
    let userReview = null;
    let isWishlisted = false;

    if (req.session.user) {
      userBooking = await Booking.findOne({
        user: req.session.user._id, pg: pg._id,
        status: { $in: ['pending', 'approved'] }
      });
      userReview = await Review.findOne({ user: req.session.user._id, pg: pg._id });
      const User = require('../models/User');
      const u = await User.findById(req.session.user._id, 'wishlist');
      isWishlisted = u?.wishlist?.some(w => w.toString() === pg._id.toString()) || false;
    }

    

    // Similar PGs
    const similar = await PG.find({
      city: pg.city,
      _id: { $ne: pg._id },
      status: 'active',
      price: { $gte: pg.price * 0.7, $lte: pg.price * 1.3 }
    }).limit(3);

     const coordinates = pg.geometry.coordinates;

    res.render('user/pg-detail', {
      title: pg.title + ' - RentEase.in',
      pg, reviews, userBooking, userReview, isWishlisted, similar , coordinates
    });
};