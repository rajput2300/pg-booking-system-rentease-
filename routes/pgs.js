const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapasync');
const controllers = require('../controllers/pg.js');


// All PGs with search & filter
router.get('/', wrapAsync(controllers.pgWithSearchAndFilter));

// Single PG detail
router.get('/:id', wrapAsync(controllers.getPgDetails));

module.exports = router;
