require('dotenv').config();
const app = require('./app');
const { connectDatabase, closeDatabase } = require('./config/database');

const PORT = process.env.PORT || 3008;

async function main() {
  await connectDatabase();

  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
