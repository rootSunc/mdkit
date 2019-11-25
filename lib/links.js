'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');

function extractLocalLinks(content) {
  var body = utils.stripCodeBlocks(content);
  var links = [];
  var inline = /\[([^\]]*)\]\(([^)]+)\)/g;
  var match;

  while ((match = inline.exec(body)) !== null) {
    links.push({
      text: match[1],
      href: match[2].trim(),
      index: match.index
    });
  }

  var ref = /^\[([^\]]+)\]:\s+(\S+)/gm;
  while ((match = ref.exec(body)) !== null) {
    links.push({
      text: match[1],
      href: match[2].trim(),
      index: match.index
    });
  }

  return links;
}

function isExternal(href) {
  return /^(https?:|mailto:|tel:|\/\/)/i.test(href);
}

function isAnchorOnly(href) {
  return href.charAt(0) === '#';
}

function normalizeHref(href) {
  var hash = href.indexOf('#');
  var query = href.indexOf('?');
  var cut = href.length;
  if (hash !== -1) {
    cut = Math.min(cut, hash);
  }
  if (query !== -1) {
    cut = Math.min(cut, query);
  }
  return href.slice(0, cut);
}

function checkFile(filePath) {
  var content = fs.readFileSync(filePath, 'utf8');
  var links = extractLocalLinks(content);
  var results = [];
  var dir = path.dirname(filePath);

  for (var i = 0; i < links.length; i++) {
    var href = links[i].href;
    if (isExternal(href) || isAnchorOnly(href) || !href) {
      continue;
    }
    var target = normalizeHref(href);
    if (!target) {
      continue;
    }
    var resolved = path.resolve(dir, target);
    var ok = fs.existsSync(resolved);
    results.push({
      file: filePath,
      href: href,
      resolved: resolved,
      ok: ok,
      text: links[i].text
    });
  }
  return results;
}

function check(target, options) {
  var files = utils.collectMarkdownFiles(target, options);
  var all = [];
  for (var i = 0; i < files.length; i++) {
    all = all.concat(checkFile(files[i]));
  }
  return {
    files: files.length,
    results: all,
    broken: all.filter(function (item) {
      return !item.ok;
    })
  };
}

function formatReport(result) {
  if (!result.results.length) {
    return 'No local links found in ' + result.files + ' file(s).';
  }
  var lines = [];
  for (var i = 0; i < result.results.length; i++) {
    var item = result.results[i];
    var mark = item.ok ? 'OK' : 'MISSING';
    lines.push('[' + mark + '] ' + item.file + ' -> ' + item.href);
  }
  lines.push('');
  lines.push(
    'Checked ' +
      result.results.length +
      ' local link(s) in ' +
      result.files +
      ' file(s); ' +
      result.broken.length +
      ' broken.'
  );
  return lines.join('\n');
}

module.exports = {
  check: check,
  checkFile: checkFile,
  extractLocalLinks: extractLocalLinks,
  formatReport: formatReport
};
