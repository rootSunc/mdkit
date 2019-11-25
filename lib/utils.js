'use strict';

var fs = require('fs');
var path = require('path');

var DEFAULT_IGNORE = {
  node_modules: true,
  '.git': true,
  coverage: true,
  dist: true,
  build: true
};

function stripCodeBlocks(text) {
  return text.replace(/```[\s\S]*?```/g, '');
}

function stripFrontMatter(text) {
  if (text.indexOf('---\n') === 0 || text.indexOf('---\r\n') === 0) {
    var end = text.indexOf('\n---', 4);
    if (end !== -1) {
      return text.slice(end + 4).replace(/^\r?\n/, '');
    }
  }
  return text;
}

function isIgnoredDir(name, ignoreMap) {
  ignoreMap = ignoreMap || DEFAULT_IGNORE;
  return !!ignoreMap[name];
}

function collectMarkdownFiles(target, options) {
  options = options || {};
  var ignoreMap = options.ignore || DEFAULT_IGNORE;
  var stats = fs.statSync(target);
  if (stats.isFile()) {
    return [target];
  }
  if (!stats.isDirectory()) {
    return [];
  }
  var results = [];
  var entries = fs.readdirSync(target);
  for (var i = 0; i < entries.length; i++) {
    var name = entries[i];
    var full = path.join(target, name);
    var st = fs.statSync(full);
    if (st.isDirectory()) {
      if (isIgnoredDir(name, ignoreMap)) {
        continue;
      }
      results = results.concat(collectMarkdownFiles(full, options));
    } else if (/\.(md|markdown)$/i.test(name)) {
      results.push(full);
    }
  }
  return results;
}

module.exports = {
  stripCodeBlocks: stripCodeBlocks,
  stripFrontMatter: stripFrontMatter,
  collectMarkdownFiles: collectMarkdownFiles,
  DEFAULT_IGNORE: DEFAULT_IGNORE
};
