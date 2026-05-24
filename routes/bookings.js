const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const wrapAsync = require('../utils/wrapasync');
const controllers = require("../controllers/bookings.js")


// My bookings
router.get('/my', isLoggedIn, wrapAsync(controllers.getMyBookingPage));

// Wishlist
router.get('/wishlist', isLoggedIn, wrapAsync(controllers.wishlist));

// Toggle wishlist
router.post('/wishlist/:pgId', isLoggedIn , wrapAsync(controllers.toggleWishList));

// Book a PG
router.post('/', isLoggedIn, wrapAsync(controllers.bookPG));

// Cancel booking
router.post('/:id/cancel', isLoggedIn, wrapAsync(controllers.cancleBooking));

module.exports = router;
