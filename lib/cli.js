'use strict';

var fs = require('fs');
var program = require('commander');
var pkg = require('../package.json');
var stats = require('./stats');

function fail(message) {
  console.error('Error: ' + message);
  process.exit(1);
}

function ensurePath(target) {
  if (!target) {
    fail('path is required');
  }
  if (!fs.existsSync(target)) {
    fail('path not found: ' + target);
  }
  return target;
}

function run(argv) {
  program
    .version(pkg.version)
    .description(pkg.description);

  program
    .command('stats <path>')
    .description('count words, headings, and code blocks in Markdown files')
    .action(function (target) {
      ensurePath(target);
      var result = stats.analyze(target);
      if (!result.items.length) {
        fail('no Markdown files found');
      }
      console.log(stats.formatReport(result));
    });

  program.parse(argv);

  if (!argv.slice(2).length) {
    program.help();
  }
}

module.exports = {
  run: run
};
