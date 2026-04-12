// Catch-all serverless entrypoint for /api/* in Vercel.
// Reuse the same Express bridge implemented in api/index.js.
module.exports = require('./index.js');
