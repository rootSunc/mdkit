'use strict';

var assert = require('assert');
var path = require('path');
var headings = require('../lib/headings');

var sample = path.join(__dirname, 'fixtures', 'sample.md');

describe('headings', function () {
  it('lists headings with slugs', function () {
    var result = headings.list(sample);
    assert.ok(result.items.length >= 5);
    assert.strictEqual(result.items[0].text, 'Sample Document');
    assert.strictEqual(result.items[0].slug, 'sample-document');
    assert.ok(result.items[0].line >= 1);
  });

  it('formats a readable outline', function () {
    var report = headings.formatReport(headings.list(sample));
    assert.ok(report.indexOf('h1') !== -1);
    assert.ok(report.indexOf('#getting-started') !== -1);
  });
});
