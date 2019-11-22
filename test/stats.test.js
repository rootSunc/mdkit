'use strict';

var assert = require('assert');
var path = require('path');
var stats = require('../lib/stats');

var sample = path.join(__dirname, 'fixtures', 'sample.md');

describe('stats', function () {
  it('counts words including CJK characters', function () {
    var result = stats.analyzeFile(sample);
    assert.ok(result.words > 10);
  });

  it('counts headings and code blocks', function () {
    var result = stats.analyzeFile(sample);
    assert.strictEqual(result.headings, 6);
    assert.strictEqual(result.codeBlocks, 1);
  });

  it('formats a report for a single file', function () {
    var result = stats.analyze(sample);
    var report = stats.formatReport(result);
    assert.ok(report.indexOf('words:') !== -1);
    assert.ok(report.indexOf('headings:') !== -1);
  });
});
