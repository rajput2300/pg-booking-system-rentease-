const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const wrapAsync = require('../utils/wrapasync');
const controllers = require('../controllers/index.js');

router.get('/', wrapAsync(controllers.index));

router.get('/about', controllers.aboutsection);

router.get('/contact', controllers.contacsection);

router.post('/contact', isLoggedIn, wrapAsync(controllers.complaintSection));

router.post('/wishlist/toggle', isLoggedIn,wrapAsync(controllers.wishListToggle));

router.get('/dashboard', isLoggedIn, wrapAsync(controllers.getUserDashboard));

module.exports = router;
