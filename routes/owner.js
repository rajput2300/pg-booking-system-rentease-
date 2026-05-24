const express = require('express');
const router = express.Router();
const { isOwner } = require('../middleware/auth');
const {storage} = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({storage});
const wrapAsync = require('../utils/wrapasync');
const controllers = require('../controllers/owner');

// Owner Dashboard
router.get('/dashboard', isOwner, wrapAsync(controllers.getOwnerDashboard));

// My PG Listings
router.get('/my-pgs', isOwner, wrapAsync(controllers.pgListing));

// Add new PG
router.get('/pgs/new', isOwner, controllers.addNewPgForm);

router.post('/pgs', isOwner,upload.array('images', 8), wrapAsync(controllers.newPgAdded));

// Edit PG
router.get('/pgs/:id/edit', isOwner, wrapAsync(controllers.pgEditForm));
router.put('/pgs/:id', isOwner, upload.array('images', 8), wrapAsync(controllers.pgEdited));

// Delete PG
router.delete('/pgs/:id', isOwner, wrapAsync(controllers.destroyPg));

// Bookings for my PGs
router.get('/bookings', isOwner , wrapAsync(controllers.bookingForPg));

// Owner can approve/reject bookings for THEIR PGs
router.post('/bookings/:id/approve', isOwner, wrapAsync(controllers.approvePgBooking));
router.post('/bookings/:id/reject', isOwner, wrapAsync(controllers.rejectPgBooking));

// Reviews for my PGs
router.get('/reviews', isOwner, wrapAsync(controllers.review));

// Profile
router.get('/profile', isOwner, wrapAsync(controllers.GetProfile));
router.post('/profile', isOwner, wrapAsync(controllers.updateProfile));

module.exports = router;
