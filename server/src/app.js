const express = require('express');
const cors = require('cors');
const habitRoutes = require('./routes/habitRoutes');
const todayRoutes = require('./routes/todayRoutes');
const completionRoutes = require('./routes/completionRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errors');

function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (request, response) => {
    response.json({ success: true, data: { status: 'ok' } });
  });
  app.use('/api/habits', habitRoutes);
  app.use('/api/today', todayRoutes);
  app.use('/api/habits/:habitId/completions', completionRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = createApp();
