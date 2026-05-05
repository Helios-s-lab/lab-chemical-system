const serverless = require('serverless-http');
const app = require('../../server/app');

exports.handler = serverless(app);