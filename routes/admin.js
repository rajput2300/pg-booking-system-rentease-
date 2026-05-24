const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const {storage} = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({storage});
const wrapAsync = require('../utils/wrapasync');
const controllers = require('../controllers/admin.js');

// Dashboard
router.get('/dashboard', isAdmin, wrapAsync(controllers.getAdminDashboard));

// PG Management
router.get('/pgs', isAdmin, wrapAsync(controllers.getPgAdminPage));
router.get('/pgs/new', isAdmin, controllers.newPGForm);
router.post('/pgs', isAdmin, upload.array('images', 8), wrapAsync(controllers.addPG));
router.get('/pgs/:id/edit', isAdmin, wrapAsync(controllers.pgEditForm));
router.put('/pgs/:id', isAdmin, upload.array('images', 8), wrapAsync(controllers.updatedPgSuccessfully));
router.delete('/pgs/:id', isAdmin, wrapAsync(controllers.destroyPG));
router.post('/pgs/:id/approve', isAdmin, wrapAsync(controllers.approvelisting));
router.post('/pgs/:id/reject-listing', isAdmin, wrapAsync(controllers.rejectListing));


// Booking Management
router.get('/bookings', isAdmin, wrapAsync(controllers.manageBooking));
router.post('/bookings/:id/approve', isAdmin, wrapAsync(controllers.bookingApproved));
router.post('/bookings/:id/reject', isAdmin, wrapAsync(controllers.bookingRejected));


// Owner Management
router.get('/owners', isAdmin, wrapAsync(controllers.manageOwner));
router.post('/owners/:id/approve', isAdmin, wrapAsync(controllers.approveOwner));
router.post('/owners/:id/reject', isAdmin, wrapAsync(controllers.rejectOwner));

// User Management
router.get('/users', isAdmin, wrapAsync(controllers.manageUsers));
router.post('/users/:id/delete', isAdmin, wrapAsync(controllers.destroyUser));

// Complaints
router.get('/complaints', isAdmin, wrapAsync(controllers.seeComplaints));
router.post('/complaints/:id/reply', isAdmin, wrapAsync(controllers.replyComplaints));
router.post('/complaints/:id/progress', isAdmin, wrapAsync(controllers.conplaintsProgress));


module.exports = router;
