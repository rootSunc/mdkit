'use strict';

var fs = require('fs');
var program = require('commander');
var pkg = require('../package.json');
var stats = require('./stats');
var toc = require('./toc');
var frontmatter = require('./frontmatter');
var links = require('./links');
var utils = require('./utils');
var init = require('./init');
var headings = require('./headings');

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
    .option('--json', 'print machine-readable JSON')
    .option('--summary', 'print only the aggregate totals')
    .option('--ignore <dirs>', 'comma-separated directory names to skip', '')
    .action(function (target, cmd) {
      ensurePath(target);
      var result = stats.analyze(target, {
        ignore: utils.parseIgnoreList(cmd.ignore)
      });
      if (!result.items.length) {
        fail('no Markdown files found');
      }
      if (cmd.summary && !cmd.json) {
        console.log(stats.formatSummary(result.summary));
        return;
      }
      if (cmd.json) {
        console.log(JSON.stringify(cmd.summary ? result.summary : result, null, 2));
      } else {
        console.log(stats.formatReport(result));
      }
    });

  program
    .command('toc <path>')
    .description('generate or update a table of contents using <!-- toc --> markers')
    .option('--min-level <n>', 'minimum heading level to include', '2')
    .option('--max-level <n>', 'maximum heading level to include', '6')
    .option('--stdout', 'print result instead of writing the file')
    .option('--dry-run', 'show what would change without writing files')
    .option('--ignore <dirs>', 'comma-separated directory names to skip', '')
    .action(function (target, cmd) {
      ensurePath(target);
      var options = {
        minLevel: parseInt(cmd.minLevel, 10) || 2,
        maxLevel: parseInt(cmd.maxLevel, 10) || 6,
        write: !cmd.stdout && !cmd.dryRun,
        ignore: utils.parseIgnoreList(cmd.ignore)
      };
      var results = toc.generateMany(target, options);
      if (!results.length) {
        fail('no Markdown files found');
      }
      if (cmd.stdout) {
        if (results.length === 1) {
          console.log(results[0].content);
        } else {
          fail('--stdout only supports a single file');
        }
        return;
      }
      var updated = 0;
      var skipped = 0;
      for (var i = 0; i < results.length; i++) {
        var result = results[i];
        if (!result.toc) {
          skipped++;
          continue;
        }
        if (result.changed) {
          updated++;
          console.log(
            (cmd.dryRun ? 'Would update TOC in ' : 'Updated TOC in ') +
              result.file
          );
        } else {
          console.log('TOC already up to date in ' + result.file);
        }
      }
      if (!updated && skipped === results.length) {
        fail('no headings found for table of contents');
      }
    });

  program
    .command('fm <file>')
    .description('read or set simple YAML front-matter fields')
    .option('-g, --get <key>', 'get a single front-matter field')
    .option('-s, --set <key=value>', 'set a front-matter field')
    .option('-d, --delete <key>', 'delete a front-matter field')
    .option('--json', 'print front-matter as JSON')
    .option('--dry-run', 'preview front-matter changes without writing')
    .action(function (file, cmd) {
      ensureFile(file);
      if (cmd.set) {
        var eq = cmd.set.indexOf('=');
        if (eq === -1) {
          fail('--set expects key=value');
        }
        var key = cmd.set.slice(0, eq);
        var value = cmd.set.slice(eq + 1);
        var updated = frontmatter.set(file, key, value, {
          write: !cmd.dryRun
        });
        console.log(
          (cmd.dryRun ? 'Would set ' : 'Set ') + key + ' in ' + file
        );
        if (!updated.changed) {
          console.log('(no changes)');
        }
        return;
      }
      if (cmd.delete) {
        frontmatter.set(file, cmd.delete, null, { write: !cmd.dryRun });
        console.log(
          (cmd.dryRun ? 'Would delete ' : 'Deleted ') +
            cmd.delete +
            ' from ' +
            file
        );
        return;
      }
      if (cmd.get) {
        var valueGet = frontmatter.get(file, cmd.get);
        if (valueGet === undefined) {
          fail('field not found: ' + cmd.get);
        }
        if (cmd.json) {
          var obj = {};
          obj[cmd.get] = valueGet;
          console.log(JSON.stringify(obj, null, 2));
        } else {
          console.log(valueGet);
        }
        return;
      }
      var attrs = frontmatter.get(file);
      if (cmd.json) {
        console.log(JSON.stringify(attrs, null, 2));
        return;
      }
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
    .command('init [dir]')
    .description('scaffold a starter Markdown notes directory')
    .option('-f, --force', 'overwrite an existing index.md')
    .option('-t, --template <name>', 'template to use: notes, blog, or changelog', 'notes')
    .action(function (dir, cmd) {
      var result = init.scaffold(dir || 'docs', {
        force: !!cmd.force,
        template: cmd.template || 'notes'
      });
      console.log(result.message);
      if (!result.created) {
        process.exit(1);
      }
    });


  program
    .command('headings <path>')
    .description('list headings and slugs from Markdown files')
    .option('--json', 'print machine-readable JSON')
    .option('--ignore <dirs>', 'comma-separated directory names to skip', '')
    .action(function (target, cmd) {
      ensurePath(target);
      var result = headings.list(target, {
        ignore: utils.parseIgnoreList(cmd.ignore)
      });
      if (!result.files) {
        fail('no Markdown files found');
      }
      if (cmd.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(headings.formatReport(result));
      }
    });

  program
    .command('links <path>')
    .description('check whether local relative Markdown links exist')
    .option('--json', 'print machine-readable JSON')
    .option('--ignore <dirs>', 'comma-separated directory names to skip', '')
    .action(function (target, cmd) {
      ensurePath(target);
      var result = links.check(target, {
        ignore: utils.parseIgnoreList(cmd.ignore)
      });
      if (!result.files) {
        fail('no Markdown files found');
      }
      if (cmd.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(links.formatReport(result));
      }
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
