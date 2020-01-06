'use strict';

var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var init = require('../lib/init');

describe('init', function () {
  it('scaffolds a docs index file', function () {
    var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdkit-'));
    var target = path.join(dir, 'notes');
    var result = init.scaffold(target);
    assert.strictEqual(result.created, true);
    assert.ok(fs.existsSync(result.path));
    var content = fs.readFileSync(result.path, 'utf8');
    assert.ok(content.indexOf('title: Notes') !== -1);
    assert.ok(content.indexOf('<!-- toc -->') !== -1);
  });

  it('refuses to overwrite without force', function () {
    var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdkit-'));
    init.scaffold(dir);
    var second = init.scaffold(dir);
    assert.strictEqual(second.created, false);
  });

  it('can scaffold a blog template', function () {
    var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdkit-'));
    var result = init.scaffold(dir, { template: 'blog' });
    assert.strictEqual(result.created, true);
    var content = fs.readFileSync(result.path, 'utf8');
    assert.ok(content.indexOf('Untitled Post') !== -1);
    assert.ok(content.indexOf('tags: draft') !== -1);
  });

  it('rejects unknown templates', function () {
    var result = init.scaffold('/tmp', { template: 'nope', write: false });
    assert.strictEqual(result.created, false);
    assert.ok(result.message.indexOf('unknown template') !== -1);
  });
});
