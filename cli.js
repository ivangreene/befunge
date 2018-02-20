#!/usr/bin/env node

let Befunge = require('./');

let fs = require('fs');

let programs = process.argv.slice(2);

let befunge = new Befunge(process.stdin, process.stdout,
  { wsNoDestroy: true });

for (let i = 0; i < programs.length; i++) {
  befunge.load(fs.readFileSync(programs[i], 'utf8'));
  befunge.run();
}
