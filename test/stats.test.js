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
    assert.strictEqual(result.headings, 7);
    assert.strictEqual(result.codeBlocks, 1);
  });

  it('formats a report for a single file', function () {
    var result = stats.analyze(sample);
    var report = stats.formatReport(result);
    assert.ok(report.indexOf('words:') !== -1);
    assert.ok(report.indexOf('headings:') !== -1);
  });

  it('estimates reading minutes', function () {
    assert.strictEqual(stats.readingMinutes(0), 0);
    assert.strictEqual(stats.readingMinutes(50), 1);
    assert.strictEqual(stats.readingMinutes(450), 3);
    var result = stats.analyzeFile(sample);
    assert.ok(result.readingMinutes >= 1);
    assert.ok(stats.formatReport(stats.analyze(sample)).indexOf('reading time:') !== -1);
  });
});
