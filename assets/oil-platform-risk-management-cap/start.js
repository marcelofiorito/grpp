'use strict';
const cds = require('@sap/cds');

cds.root = __dirname;

cds.deploy('db')
  .then(() => require('@sap/cds/server.js')())
  .catch(err => { console.error(err); process.exit(1); });
