const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { getHistory } = require('../controllers/habitController');

const router = express.Router();
router.get('/', asyncHandler(getHistory));

module.exports = router;