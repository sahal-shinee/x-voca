// Force Vercel bundler to trace and include mysql2 dialect driver
require('mysql2');

const app = require('../app');

// Serverless function handler for Vercel
module.exports = app;
