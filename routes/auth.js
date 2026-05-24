const express = require('express');
const router = express.Router();
const { isNotLoggedIn } = require('../middleware/auth');
const wrapAsync = require('../utils/wrapasync');
const controllers = require('../controllers/auth.js')

// Register - User
router.get('/register', isNotLoggedIn, controllers.getRegistrationForm );
router.post('/register', isNotLoggedIn,wrapAsync(controllers.registerUser));

// Register - Owner
router.get('/register-owner', isNotLoggedIn, controllers.ownerRegistrationForm);
router.post('/register-owner', isNotLoggedIn , wrapAsync(controllers.registerOwner));

// Login
router.get('/login', controllers.loginForm);
router.post('/login', wrapAsync(controllers.loggedin));

// Logout
router.post('/logout', controllers.loggedOut);

module.exports = router;
