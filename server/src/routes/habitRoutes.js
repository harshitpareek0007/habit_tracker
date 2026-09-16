const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { requireObjectId } = require('../middleware/validation');
const {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  archiveHabit,
  restoreHabit
} = require('../controllers/habitController');

const router = express.Router();

router.get('/', asyncHandler(getHabits));
router.post('/', asyncHandler(createHabit));
router.get('/:habitId', requireObjectId, asyncHandler(getHabit));
router.patch('/:habitId', requireObjectId, asyncHandler(updateHabit));
router.post('/:habitId/archive', requireObjectId, asyncHandler(archiveHabit));
router.post('/:habitId/restore', requireObjectId, asyncHandler(restoreHabit));

module.exports = router;
