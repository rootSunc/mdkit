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
});
