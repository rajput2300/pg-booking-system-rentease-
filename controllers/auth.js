const User = require('../models/User');

module.exports.getRegistrationForm = (req, res) => {
  res.render('auth/register', { title: 'Register - RentEase.in' });
};

module.exports.registerUser = async (req, res) => {
    const { username, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      req.flash('error', 'Email already registered.');
      return res.redirect('/auth/register');
    }
    const user = await User.create({ username, email, password, phone });
    req.session.user = { _id: user._id, username: user.username, email: user.email, role: user.role, ownerApproved: false };
    req.flash('success', `Welcome to RentEase, ${user.username}! 🎉`);
    res.redirect('/');
};

module.exports.ownerRegistrationForm = (req, res) => {
  res.render('auth/register-owner', { title: 'Register as PG Owner - RentEase.in' });
};

module.exports.registerOwner = async (req, res) => {
    const { username, email, password, phone, businessName } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      req.flash('error', 'Email already registered.');
      return res.redirect('/auth/register-owner');
    }
    const user = await User.create({ username, email, password, phone, businessName, role: 'owner', ownerApproved: false });
    req.session.user = { _id: user._id, username: user.username, email: user.email, role: user.role, ownerApproved: false };
    req.flash('success', `Welcome! Your owner account is under review. You'll be notified once approved. 🎉`);
    res.redirect('/owner/dashboard');
};

module.exports.loginForm = (req, res) => {
  // If already logged in, redirect appropriately (but don't block)
  if (req.session.user) {
    if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
    if (req.session.user.role === 'owner') return res.redirect('/owner/dashboard');
    return res.redirect('/');
  }
  res.render('auth/login', { title: 'Login - RentEase.in' });
};

module.exports.loggedin = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }
    // Always fetch fresh ownerApproved from DB
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      ownerApproved: user.ownerApproved === true  // explicit boolean
    };
    req.flash('success', `Welcome back, ${user.username}!`);
    if (user.role === 'admin') return res.redirect('/admin/dashboard');
    if (user.role === 'owner') return res.redirect('/owner/dashboard');
    res.redirect('/');
};

module.exports.loggedOut = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};