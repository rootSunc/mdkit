'use strict';

var assert = require('assert');
var path = require('path');
var utils = require('../lib/utils');

describe('utils', function () {
  it('strips fenced code blocks', function () {
    var text = 'before\n```js\ncode\n```\nafter';
    assert.strictEqual(utils.stripCodeBlocks(text), 'before\n\nafter');
  });

  it('collects markdown files from fixtures', function () {
    var dir = path.join(__dirname, 'fixtures');
    var files = utils.collectMarkdownFiles(dir);
    assert.ok(files.length >= 2);
  });
});
