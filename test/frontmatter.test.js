'use strict';

var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var frontmatter = require('../lib/frontmatter');

describe('frontmatter', function () {
  it('parses simple key/value front matter', function () {
    var parsed = frontmatter.parse(
      '---\ntitle: Hello\ntags: demo\n---\n\nBody\n'
    );
    assert.strictEqual(parsed.hasFrontMatter, true);
    assert.strictEqual(parsed.attributes.title, 'Hello');
    assert.strictEqual(parsed.attributes.tags, 'demo');
    assert.ok(parsed.body.indexOf('Body') !== -1);
  });

  it('sets and deletes fields on disk', function () {
    var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdkit-'));
    var file = path.join(dir, 'doc.md');
    fs.writeFileSync(file, '# Title\n\nBody\n', 'utf8');

    frontmatter.set(file, 'title', 'Demo');
    assert.strictEqual(frontmatter.get(file, 'title'), 'Demo');

    frontmatter.set(file, 'title', null);
    var attrs = frontmatter.get(file);
    assert.strictEqual(attrs.title, undefined);
  });
});
