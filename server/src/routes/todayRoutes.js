const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { getTodayHabits } = require('../controllers/habitController');

const router = express.Router();
router.get('/', asyncHandler(getTodayHabits));

module.exports = router;
