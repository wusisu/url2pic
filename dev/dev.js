
process.env.NODE_ENV = 'development';

const service = require('../src/service');

const config = require('./config.js');

service.init(config).serve();