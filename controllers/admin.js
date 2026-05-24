const PG = require('../models/PG');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const opencage = require('opencage-api-client');


module.exports.getAdminDashboard = async (req, res, next) => {
    const [totalPGs, totalUsers, totalOwners, totalBookings, pendingBookings, totalRevenueAgg, complaints, pendingPGs, pendingOwners] = await Promise.all([
      PG.countDocuments(),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'owner' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Complaint.countDocuments({ status: 'open' }),
      PG.countDocuments({ status: 'pending_approval' }),
      User.countDocuments({ role: 'owner', ownerApproved: false })
    ]);
    const recentBookings = await Booking.find()
      .populate('user', 'username')
      .populate('pg', 'title city')
      .sort({ createdAt: -1 }).limit(5);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard - RentEase.in',
      stats: { totalPGs, totalUsers, totalOwners , totalBookings, pendingBookings, totalRevenue: totalRevenueAgg[0]?.total || 0, complaints, pendingPGs, pendingOwners },
      recentBookings
    });
};

module.exports.getPgAdminPage = async (req, res, next) => {
    const { status } = req.query;
    const query = status ? { status } : {};
    const pgs = await PG.find(query).populate('owner', 'username').sort({ createdAt: -1 });
    res.render('admin/pgs', { title: 'Manage PGs - Admin', pgs, filterStatus: status || '' });
};

module.exports.newPGForm = (req, res) => {
  res.render('admin/pg-form', { title: 'Add PG - Admin', pg: null });
};

module.exports.addPG = async (req, res, next) => {
    const { title, description, location, city, address, price, priceType, gender, totalRooms, amenities, rules, featured } = req.body;
    const images = req.files ? req.files.map(f => f.path) : [];
    const amenitiesArr = Array.isArray(amenities) ? amenities : (amenities ? [amenities] : []);
    const rulesArr = Array.isArray(rules) ? rules : (rules ? [rules] : []);
    const geoData = await opencage.geocode({
  q: address,
  key: process.env.OPENCAGE_KEY
});

let geometry = {
  type: "Point",
  coordinates: [73.8567, 18.5204] // fallback
};

if (geoData.results.length) {
  geometry = {
    type: "Point",
    coordinates: [
      geoData.results[0].geometry.lng,
      geoData.results[0].geometry.lat
    ]
  };
}
    await PG.create({ title, description, location, city, address, price: Number(price), priceType, gender, totalRooms: Number(totalRooms), availableRooms: Number(totalRooms), amenities: amenitiesArr, rules: rulesArr, images, owner: req.session.user._id, featured: featured === 'on', status: 'active' , geometry });
    req.flash('success', 'PG listing added successfully!');
    res.redirect('/admin/pgs');
};

module.exports.pgEditForm = async (req, res, next) => {
    const pg = await PG.findById(req.params.id);
    if (!pg) { req.flash('error', 'PG not found.'); return res.redirect('/admin/pgs'); }
    res.render('admin/pg-form', { title: 'Edit PG - Admin', pg });
};

module.exports.updatedPgSuccessfully = async (req, res, next) => {
    const { title, description, location, city, address, price, priceType, gender, totalRooms, availableRooms, amenities, rules, featured, status } = req.body;
    const pg = await PG.findById(req.params.id);
    if (!pg) { req.flash('error', 'PG not found.');
         return res.redirect('/admin/pgs'); 
        }
    const newImages = req.files ? req.files.map(f => f.path) : [];
    const amenitiesArr = Array.isArray(amenities) ? amenities : (amenities ? [amenities] : []);
    const rulesArr = Array.isArray(rules) ? rules : (rules ? [rules] : []);
    Object.assign(pg, { title, description, location, city, address, price: Number(price), priceType, gender, totalRooms: Number(totalRooms), availableRooms: Number(availableRooms), amenities: amenitiesArr, rules: rulesArr, status, featured: featured === 'on', images: newImages.length ? [...pg.images, ...newImages] : pg.images });
    await pg.save();
    req.flash('success', 'PG updated successfully!');
    res.redirect('/admin/pgs');
};

module.exports.destroyPG = async (req, res, next) => {
    await PG.findByIdAndDelete(req.params.id);
    req.flash('success', 'PG deleted.');
    res.redirect('/admin/pgs');
};

module.exports.approvelisting = async (req, res, next) => {
    await PG.findByIdAndUpdate(req.params.id, { status: 'active' });
    req.flash('success', 'PG listing approved and is now live!');
    res.redirect('/admin/pgs');
};

module.exports.rejectListing = async (req, res, next) => {
    await PG.findByIdAndUpdate(req.params.id, { status: 'inactive' });
    req.flash('success', 'PG listing rejected.');
    res.redirect('/admin/pgs');
};

module.exports.manageBooking = async (req, res, next) => {
    const { status } = req.query;
    const query = status ? { status } : {};
    const bookings = await Booking.find(query).populate('user', 'username email phone').populate('pg', 'title city price').sort({ createdAt: -1 });
    res.render('admin/bookings', { title: 'Manage Bookings - Admin', bookings, filterStatus: status || '' });
};

module.exports.bookingApproved = async (req, res, next) => {
    const booking = await Booking.findById(req.params.id).populate('pg');
    if (booking) {
      booking.status = 'approved';
      booking.adminNote = req.body.note || '';
      await booking.save();
      if (booking.pg && booking.pg.availableRooms > 0) {
        await PG.findByIdAndUpdate(booking.pg._id, { $inc: { availableRooms: -1 } });
      }
    }
    req.flash('success', 'Booking approved!');
    res.redirect('/admin/bookings');

};

module.exports.bookingRejected = async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);
    if (booking) { booking.status = 'rejected'; booking.adminNote = req.body.note || ''; await booking.save(); }
    req.flash('success', 'Booking rejected.');
    res.redirect('/admin/bookings');
};

module.exports.manageOwner = async (req, res, next) => {
    const owners = await User.find({ role: 'owner' }).sort({ ownerApproved: 1, createdAt: -1 });
    const ownerStats = await Promise.all(owners.map(async o => {
      const pgCount = await PG.countDocuments({ owner: o._id });
      return { ...o.toObject(), pgCount };
    }));
    res.render('admin/owners', { title: 'Manage Owners - Admin', owners: ownerStats });
};

module.exports.approveOwner = async (req, res, next) => {
    const result = await User.findByIdAndUpdate(req.params.id, { $set: { ownerApproved: true } }, { new: true });
    if (!result) { req.flash('error', 'Owner not found.'); return res.redirect('/admin/owners'); }
    req.flash('success', `Owner "${result.username}" approved!`);
    res.redirect('/admin/owners');
};

module.exports.rejectOwner = async (req, res, next) => {
    await User.findByIdAndUpdate(req.params.id, { $set: { ownerApproved: false, role: 'user' } });
    req.flash('success', 'Owner application rejected.');
    res.redirect('/admin/owners');
};

module.exports.manageUsers = async (req, res, next) => {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.render('admin/users', { title: 'Manage Users - Admin', users });
};

module.exports.destroyUser = async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'User deleted.');
    res.redirect('/admin/users');
};

module.exports.seeComplaints = async (req, res, next) => {
    const complaints = await Complaint.find().populate('user', 'username email').populate('pg', 'title').sort({ createdAt: -1 });
    res.render('admin/complaints', { title: 'Complaints - Admin', complaints });
};

module.exports.replyComplaints = async (req, res, next) => {
    await Complaint.findByIdAndUpdate(req.params.id, { adminReply: req.body.reply, status: 'resolved' });
    req.flash('success', 'Reply sent and complaint resolved.');
    res.redirect('/admin/complaints');
};

module.exports.conplaintsProgress = async (req, res, next) => {
    await Complaint.findByIdAndUpdate(req.params.id, { status: 'in-progress' });
    req.flash('success', 'Complaint marked as in-progress.');
    res.redirect('/admin/complaints');
};