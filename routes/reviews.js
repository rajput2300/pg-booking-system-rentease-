const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const wrapAsync = require('../utils/wrapasync');
const controllers = require('../controllers/review');

router.post('/', isLoggedIn, wrapAsync(controllers.postReview));

router.delete('/:id', isLoggedIn, wrapAsync(controllers.destroyReview));

module.exports = router;
