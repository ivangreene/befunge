#!/usr/bin/env node

let befunge = require('./');

let fs = require('fs');

let programs = process.argv.slice(2);

for (let i = 0; i < programs.length; i++)
  befunge(fs.readFileSync(programs[i], 'utf8'),
    process.stdin, process.stdout);
