'use strict';

var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var toc = require('../lib/toc');

describe('toc', function () {
  it('slugifies heading text', function () {
    assert.strictEqual(toc.slugify('Getting Started'), 'getting-started');
  });

  it('builds a nested table of contents', function () {
    var headings = [
      { level: 2, text: 'One' },
      { level: 3, text: 'Nested' },
      { level: 2, text: 'Two' }
    ];
    var body = toc.buildToc(headings, 2);
    assert.ok(body.indexOf('- [One](#one)') !== -1);
    assert.ok(body.indexOf('  - [Nested](#nested)') !== -1);
    assert.ok(body.indexOf('- [Two](#two)') !== -1);
  });

  it('inserts toc markers into a file', function () {
    var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdkit-'));
    var file = path.join(dir, 'doc.md');
    fs.writeFileSync(
      file,
      '# Title\n\n## Alpha\n\ntext\n\n## Beta\n',
      'utf8'
    );
    var result = toc.generate(file, { write: true });
    assert.ok(result.changed);
    var content = fs.readFileSync(file, 'utf8');
    assert.ok(content.indexOf('<!-- toc -->') !== -1);
    assert.ok(content.indexOf('- [Alpha](#alpha)') !== -1);
    assert.ok(content.indexOf('<!-- tocstop -->') !== -1);
  });
});
