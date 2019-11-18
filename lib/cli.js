'use strict';

var fs = require('fs');
var program = require('commander');
var pkg = require('../package.json');
var stats = require('./stats');
var toc = require('./toc');

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

function ensureFile(target) {
  ensurePath(target);
  if (!fs.statSync(target).isFile()) {
    fail('expected a file: ' + target);
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

  program
    .command('toc <file>')
    .description('generate or update a table of contents using <!-- toc --> markers')
    .option('--min-level <n>', 'minimum heading level to include', '2')
    .option('--stdout', 'print result instead of writing the file')
    .action(function (file, cmd) {
      ensureFile(file);
      var result = toc.generate(file, {
        minLevel: parseInt(cmd.minLevel, 10) || 2,
        write: !cmd.stdout
      });
      if (!result.toc) {
        fail('no headings found for table of contents');
      }
      if (cmd.stdout) {
        console.log(result.content);
      } else if (result.changed) {
        console.log('Updated TOC in ' + file);
      } else {
        console.log('TOC already up to date in ' + file);
      }
    });

  program.parse(argv);

  if (!argv.slice(2).length) {
    program.help();
  }
}

module.exports = {
  run: run
};
