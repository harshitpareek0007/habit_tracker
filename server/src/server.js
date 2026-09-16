require('dotenv').config();
const app = require('./app');
const { connectDatabase } = require('./config/database');

const port = Number(process.env.PORT || 5000);

async function startServer() {
  await connectDatabase();
  return app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Unable to start server: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { startServer };
