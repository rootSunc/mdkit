'use strict';

var fs = require('fs');
var program = require('commander');
var pkg = require('../package.json');
var stats = require('./stats');
var toc = require('./toc');
var frontmatter = require('./frontmatter');
var links = require('./links');

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

  program
    .command('fm <file>')
    .description('read or set simple YAML front-matter fields')
    .option('-g, --get <key>', 'get a single front-matter field')
    .option('-s, --set <key=value>', 'set a front-matter field')
    .option('-d, --delete <key>', 'delete a front-matter field')
    .action(function (file, cmd) {
      ensureFile(file);
      if (cmd.set) {
        var eq = cmd.set.indexOf('=');
        if (eq === -1) {
          fail('--set expects key=value');
        }
        var key = cmd.set.slice(0, eq);
        var value = cmd.set.slice(eq + 1);
        var updated = frontmatter.set(file, key, value);
        console.log('Set ' + key + ' in ' + file);
        if (!updated.changed) {
          console.log('(no changes)');
        }
        return;
      }
      if (cmd.delete) {
        frontmatter.set(file, cmd.delete, null);
        console.log('Deleted ' + cmd.delete + ' from ' + file);
        return;
      }
      if (cmd.get) {
        var valueGet = frontmatter.get(file, cmd.get);
        if (valueGet === undefined) {
          fail('field not found: ' + cmd.get);
        }
        console.log(valueGet);
        return;
      }
      var attrs = frontmatter.get(file);
      var keys = Object.keys(attrs);
      if (!keys.length) {
        console.log('(no front matter)');
        return;
      }
      for (var i = 0; i < keys.length; i++) {
        console.log(keys[i] + ': ' + attrs[keys[i]]);
      }
    });

  program
    .command('links <path>')
    .description('check whether local relative Markdown links exist')
    .action(function (target) {
      ensurePath(target);
      var result = links.check(target);
      if (!result.files) {
        fail('no Markdown files found');
      }
      console.log(links.formatReport(result));
      if (result.broken.length) {
        process.exit(1);
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
