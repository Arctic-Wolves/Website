const path = require('path');

const config = process.env.NODE_ENV === 'development' ?
  require('./.config.json') :
  {};

const App = require('./app');

module.exports = new App(
  path.resolve('../../db'),
  process.env.TOKEN || config.token,
  process.env.OWNER || config.owner
);
