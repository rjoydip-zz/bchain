#!/usr/bin/env node

const vorpal = require('vorpal')();
const CLI = require('./src/cli.js');

new CLI(vorpal);