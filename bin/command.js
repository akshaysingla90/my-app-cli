#!/usr/bin/env node
const program = require('commander');

/* command to check the version */
program
  .version('1.0.0')
  .description('Boilerplate CLI')

program.parse(process.argv);