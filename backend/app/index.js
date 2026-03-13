// Uncaught Exception 핸들러
process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]', error.message);
  console.error(error.stack);
  process.exit(1);
});

// Unhandled Promise Rejection 핸들러
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
  process.exit(1);
});

const app = require('./core/wheeparam')

app.start();
