exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) return next();
  req.flash('error', 'Please login to continue.');
  res.redirect('/auth/login');
};

exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') return next();
  req.flash('error', 'Access denied. Admin only.');
  res.redirect('/');
};

exports.isOwner = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'owner') return next();
  req.flash('error', 'Access denied. Owner account required.');
  res.redirect('/');
};

exports.isApprovedOwner = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'owner' && req.session.user.ownerApproved) return next();
  if (req.session.user && req.session.user.role === 'owner') {
    req.flash('error', 'Your owner account is pending admin approval. You will be notified once approved.');
    return res.redirect('/owner/dashboard');
  }
  req.flash('error', 'Owner account required.');
  res.redirect('/');
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.session.user) return next();
  res.redirect('/');
};
