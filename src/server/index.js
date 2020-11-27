const path = require('path');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const pathClient = path.resolve(__dirname, '../../build/src');

module.exports = express()
  .use(helmet())
  .use(cors({ origin: ['localhost:7777'] }))
  .use(express.static(pathClient))
  .use('/', (req, res) => res.sendFile('index.html', { root: pathClient }));
