const PG = require('../models/PG');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/User');

module.exports.getOwnerDashboard = async (req, res, next) => {
    const owner = await User.findById(req.session.user._id);
    if (!owner) { req.session.destroy(); return res.redirect('/auth/login'); }

    // Sync session with latest DB approval status
    req.session.user.ownerApproved = owner.ownerApproved === true;
    req.session.user.businessName = owner.businessName;

    const myPGs = await PG.find({ owner: req.session.user._id });
    const pgIds = myPGs.map(p => p._id);

    const [totalBookings, pendingBookings, approvedBookings, totalReviews] = await Promise.all([
      Booking.countDocuments({ pg: { $in: pgIds } }),
      Booking.countDocuments({ pg: { $in: pgIds }, status: 'pending' }),
      Booking.countDocuments({ pg: { $in: pgIds }, status: 'approved' }),
      Review.countDocuments({ pg: { $in: pgIds } })
    ]);

    const recentBookings = await Booking.find({ pg: { $in: pgIds } })
      .populate('user', 'username email phone')
      .populate('pg', 'title city price')
      .sort({ createdAt: -1 }).limit(5);

    const totalRevenueAgg = await Booking.aggregate([
      { $match: { pg: { $in: pgIds }, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.render('owner/dashboard', {
      title: 'Owner Dashboard - RentEase.in',
      owner,
      stats: {
        totalPGs: myPGs.length,
        activePGs: myPGs.filter(p => p.status === 'active').length,
        pendingPGs: myPGs.filter(p => p.status === 'pending_approval').length,
        totalBookings, pendingBookings, approvedBookings, totalReviews,
        totalRevenue: totalRevenueAgg[0]?.total || 0
      },
      recentBookings
    });
};

module.exports.pgListing = async (req, res, next) => {
    const pgs = await PG.find({ owner: req.session.user._id }).sort({ createdAt: -1 });
    res.render('owner/my-pgs', { title: 'My PG Listings - Owner', pgs });
};

module.exports.addNewPgForm = (req, res) => {
  if (!req.session.user.ownerApproved) {
    req.flash('error', 'Your owner account must be approved before you can list PGs.');
    return res.redirect('/owner/dashboard');
  }
  res.render('owner/pg-form', { title: 'Add PG Listing - Owner', pg: null });
};

const opencage = require('opencage-api-client');

module.exports.newPgAdded = async (req, res, next) => {
  try {
    if (!req.session.user.ownerApproved) {
      req.flash('error', 'Account not yet approved.');
      return res.redirect('/owner/dashboard');
    }

    const { title, description, location, city, address, price, priceType, gender, totalRooms, amenities, rules } = req.body;

    const images = req.files ? req.files.map(f => '/images/uploads/' + f.filename) : [];
    const amenitiesArr = Array.isArray(amenities) ? amenities : (amenities ? [amenities] : []);
    const rulesArr = Array.isArray(rules) ? rules : (rules ? [rules] : []);

    // GEOCODING PART
    const geoData = await opencage.geocode({
      q: address,
      key: process.env.OPENCAGE_KEY
    });

    if (!geoData.results.length) {
      req.flash('error', 'Invalid address. Try again.');
      return res.redirect('/owner/add-pg');
    }

    const newPG = await PG.create({
      title, description, location, city, address,
      price: Number(price), priceType, gender,
      totalRooms: Number(totalRooms), availableRooms: Number(totalRooms),
      amenities: amenitiesArr, rules: rulesArr, images,
      owner: req.session.user._id,
      status: 'pending_approval',

      geometry: {
        type: "Point",
        coordinates: [
          geoData.results[0].geometry.lng,
          geoData.results[0].geometry.lat
        ]
      }
    });

    req.flash('success', 'PG submitted! It will go live after admin review.');
    res.redirect('/owner/my-pgs');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong');
    res.redirect('/owner/my-pgs');
  }
};


module.exports.pgEditForm = async (req, res, next) => {
    const pg = await PG.findOne({ _id: req.params.id, owner: req.session.user._id });
    if (!pg) {
       req.flash('error', 'PG not found or access denied.'); 
       return res.redirect('/owner/my-pgs'); 
    }
    res.render('owner/pg-form', { title: 'Edit PG - Owner', pg });
};

module.exports.pgEdited = async (req, res, next) => {
  const pg = await PG.findOne({ _id: req.params.id, owner: req.session.user._id });
  if (!pg) {
    req.flash('error', 'Access denied.');
    return res.redirect('/owner/my-pgs');
  }

  const {
    title, description, location, city, address,
    price, priceType, gender, totalRooms, availableRooms,
    amenities, rules
  } = req.body;

  // 🔥 GEOCODING if address changed
  if (address !== pg.address) {
    const geoData = await opencage.geocode({
      q: address,
      key: process.env.OPENCAGE_KEY
    });

    if (geoData.results.length) {
      pg.geometry = {
        type: "Point",
        coordinates: [
          geoData.results[0].geometry.lng,
          geoData.results[0].geometry.lat
        ]
      };
    }
  }

  Object.assign(pg, {
    title, description, location, city, address,
    price: Number(price), priceType, gender,
    totalRooms: Number(totalRooms),
    availableRooms: Number(availableRooms),
    amenities,
    rules,
    status: 'pending_approval'
  });

  await pg.save();

  req.flash('success', 'PG updated!');
  res.redirect('/owner/my-pgs');
};

module.exports.destroyPg = async (req, res, next) => {
    const pg = await PG.findOne({ _id: req.params.id, owner: req.session.user._id });
    if (!pg) { req.flash('error', 'Access denied.'); return res.redirect('/owner/my-pgs'); }
    await pg.deleteOne();
    req.flash('success', 'PG listing deleted.');
    res.redirect('/owner/my-pgs');
};

module.exports.bookingForPg = async (req, res, next) => {
    const myPGs = await PG.find({ owner: req.session.user._id }, '_id');
    const pgIds = myPGs.map(p => p._id);
    const { status } = req.query;
    const query = { pg: { $in: pgIds } };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('user', 'username email phone')
      .populate('pg', 'title city price')
      .sort({ createdAt: -1 });

    res.render('owner/bookings', { title: 'My Bookings - Owner', bookings, filterStatus: status || '' });
};

module.exports.approvePgBooking = async (req, res, next) => {
    const booking = await Booking.findById(req.params.id).populate('pg');
    if (!booking) {
       req.flash('error', 'Booking not found.'); 
       return res.redirect('/owner/bookings'); }
    // Verify this booking is for owner's PG
    if (booking.pg.owner.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'Access denied.'); 
      return res.redirect('/owner/bookings');
    }
    booking.status = 'approved';
    booking.adminNote = req.body.note || 'Approved by owner.';
    await booking.save();
    if (booking.pg.availableRooms > 0) {
      await PG.findByIdAndUpdate(booking.pg._id, { $inc: { availableRooms: -1 } });
    }
    req.flash('success', 'Booking approved!');
    res.redirect('/owner/bookings');
};

module.exports.rejectPgBooking = async (req, res, next) => {
    const booking = await Booking.findById(req.params.id).populate('pg');
    if (!booking) { req.flash('error', 'Booking not found.'); return res.redirect('/owner/bookings'); }
    if (booking.pg.owner.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'Access denied.'); return res.redirect('/owner/bookings');
    }
    booking.status = 'rejected';
    booking.adminNote = req.body.note || 'Rejected by owner.';
    await booking.save();
    req.flash('success', 'Booking rejected.');
    res.redirect('/owner/bookings');
};

module.exports.review = async (req, res, next) => {
    const myPGs = await PG.find({ owner: req.session.user._id }, '_id title');
    const pgIds = myPGs.map(p => p._id);
    const reviews = await Review.find({ pg: { $in: pgIds } })
      .populate('user', 'username')
      .populate('pg', 'title')
      .sort({ createdAt: -1 });
    res.render('owner/reviews', { title: 'Reviews - Owner', reviews });
};

module.exports.GetProfile = async (req, res, next) => {
    const owner = await User.findById(req.session.user._id);
    res.render('owner/profile', { title: 'My Profile - Owner', owner });
};

module.exports.updateProfile = async (req, res, next) => {
    const { username, phone, businessName } = req.body;
    await User.findByIdAndUpdate(req.session.user._id, { username, phone, businessName });
    req.session.user.username = username;
    req.flash('success', 'Profile updated successfully!');
    res.redirect('/owner/profile');
};