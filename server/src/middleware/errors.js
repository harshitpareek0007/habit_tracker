function notFoundHandler(request, response) {
  response.status(404).json({ success: false, message: `Route not found: ${request.method} ${request.originalUrl}` });
}

function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map((item) => item.message).join(', ');
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  } else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    message = 'Request body must contain valid JSON';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'A completion already exists for this habit and date';
  }

  const payload = { success: false, message };
  if (process.env.NODE_ENV !== 'production' && error.details) payload.details = error.details;
  response.status(statusCode).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
