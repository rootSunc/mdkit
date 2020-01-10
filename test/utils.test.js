'use strict';

var assert = require('assert');
var path = require('path');
var utils = require('../lib/utils');

describe('utils', function () {
  it('strips inline code', function () {
    var out = utils.stripInlineCode('use `npm install` please');
    assert.ok(out.indexOf('npm') === -1);
    assert.ok(out.indexOf('please') !== -1);
  });

  it('strips fenced code blocks', function () {
    var text = 'before\n```js\ncode\n```\nafter';
    assert.strictEqual(utils.stripCodeBlocks(text), 'before\n\nafter');
  });

  it('collects markdown files from fixtures', function () {
    var dir = path.join(__dirname, 'fixtures');
    var files = utils.collectMarkdownFiles(dir);
    assert.ok(files.length >= 2);
  });

  it('parses extra ignore directories', function () {
    var map = utils.parseIgnoreList('vendor,tmp');
    assert.strictEqual(map.node_modules, true);
    assert.strictEqual(map.vendor, true);
    assert.strictEqual(map.tmp, true);
  });
});
