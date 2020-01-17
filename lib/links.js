'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');
var toc = require('./toc');

function extractLocalLinks(content) {
  var body = utils.stripCodeBlocks(content);
  var links = [];
  var inline = /!?\[([^\]]*)\]\(([^)]+)\)/g;
  var match;

  while ((match = inline.exec(body)) !== null) {
    var kind = match[0].charAt(0) === '!' ? 'image' : 'link';
    links.push({
      text: match[1],
      href: match[2].trim(),
      index: match.index,
      kind: kind
    });
  }

  var ref = /^\[([^\]]+)\]:\s+(\S+)/gm;
  while ((match = ref.exec(body)) !== null) {
    links.push({
      text: match[1],
      href: match[2].trim(),
      index: match.index,
      kind: 'link'
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

function headingSlugSet(filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return null;
  }
  var content = fs.readFileSync(filePath, 'utf8');
  var headings = toc.extractHeadings(content);
  var seen = {};
  var set = {};
  for (var i = 0; i < headings.length; i++) {
    var base = toc.slugify(headings[i].text) || 'section';
    var slug = base;
    var n = 1;
    while (seen[slug]) {
      n += 1;
      slug = base + '-' + n;
    }
    seen[slug] = true;
    set[slug] = true;
  }
  return set;
}

function checkFile(filePath, options) {
  options = options || {};
  var content = fs.readFileSync(filePath, 'utf8');
  var links = extractLocalLinks(content);
  var results = [];
  var dir = path.dirname(filePath);
  var localSlugs = options.checkAnchors ? headingSlugSet(filePath) : null;

  for (var i = 0; i < links.length; i++) {
    var href = links[i].href;
    if (isExternal(href) || !href) {
      continue;
    }

    if (isAnchorOnly(href)) {
      if (!options.checkAnchors) {
        continue;
      }
      var anchor = href.slice(1);
      var anchorOk = !!(localSlugs && localSlugs[anchor]);
      results.push({
        file: filePath,
        href: href,
        resolved: filePath + href,
        ok: anchorOk,
        text: links[i].text,
        kind: 'anchor'
      });
      continue;
    }

    var target = normalizeHref(href);
    if (!target) {
      continue;
    }
    var resolved = path.resolve(dir, target);
    var ok = fs.existsSync(resolved);
    var hashIdx = href.indexOf('#');
    if (ok && options.checkAnchors && hashIdx !== -1) {
      var frag = href.slice(hashIdx + 1);
      if (frag) {
        var slugs = headingSlugSet(resolved);
        ok = !!(slugs && slugs[frag]);
      }
    }
    results.push({
      file: filePath,
      href: href,
      resolved: resolved,
      ok: ok,
      text: links[i].text,
      kind: links[i].kind || 'link'
    });
  }
  return results;
}

function check(target, options) {
  options = options || {};
  var files = utils.collectMarkdownFiles(target, options);
  var all = [];
  for (var i = 0; i < files.length; i++) {
    all = all.concat(checkFile(files[i], options));
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
    var kind = '';
    if (item.kind === 'image') {
      kind = ' img';
    } else if (item.kind === 'anchor') {
      kind = ' anchor';
    }
    lines.push('[' + mark + kind + '] ' + item.file + ' -> ' + item.href);
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
