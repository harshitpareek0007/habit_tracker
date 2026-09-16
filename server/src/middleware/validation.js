const mongoose = require('mongoose');
const { assertDateKey } = require('../utils/date');

function requireObjectId(request, response, next) {
  if (!mongoose.isValidObjectId(request.params.habitId)) {
    const error = new Error('Invalid habit ID');
    error.statusCode = 400;
    return next(error);
  }
  next();
}

function validateDateParam(request, response, next) {
  try {
    assertDateKey(request.params.dateKey);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { requireObjectId, validateDateParam };
