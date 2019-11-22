'use strict';

var assert = require('assert');
var path = require('path');
var links = require('../lib/links');

var sample = path.join(__dirname, 'fixtures', 'sample.md');

describe('links', function () {
  it('extracts markdown links', function () {
    var content = fsRead(sample);
    var found = links.extractLocalLinks(content);
    assert.ok(found.length >= 2);
  });

  it('reports broken local links', function () {
    var result = links.check(sample);
    var hrefs = result.broken.map(function (item) {
      return item.href;
    });
    assert.ok(hrefs.indexOf('./missing.md') !== -1);
    assert.strictEqual(
      result.results.filter(function (item) {
        return item.href === './guide.md';
      })[0].ok,
      true
    );
  });
});

function fsRead(file) {
  return require('fs').readFileSync(file, 'utf8');
}
