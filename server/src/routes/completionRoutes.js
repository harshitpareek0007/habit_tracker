const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { requireObjectId, validateDateParam } = require('../middleware/validation');
const {
  getCompletions,
  getCompletionByDate,
  updateCompletion,
  getHabitStreaks
} = require('../controllers/completionController');

const router = express.Router({ mergeParams: true });
router.use(requireObjectId);
router.get('/streaks', asyncHandler(getHabitStreaks));
router.get('/', asyncHandler(getCompletions));
router.get('/:dateKey', validateDateParam, asyncHandler(getCompletionByDate));
router.put('/:dateKey', validateDateParam, asyncHandler(updateCompletion));

module.exports = router;
