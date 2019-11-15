'use strict';

var program = require('commander');
var pkg = require('../package.json');

function run(argv) {
  program
    .version(pkg.version)
    .description(pkg.description);

  program
    .command('help')
    .description('display help information')
    .action(function () {
      program.help();
    });

  program.parse(argv);

  if (!argv.slice(2).length) {
    program.help();
  }
}

module.exports = {
  run: run
};
