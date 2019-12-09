'use strict';

var fs = require('fs');
var utils = require('./utils');

var TOC_START = '<!-- toc -->';
var TOC_END = '<!-- tocstop -->';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractHeadings(content) {
  var lines = content.split(/\r?\n/);
  var headings = [];
  var inCode = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (/^```/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      continue;
    }
    var match = /^(#{1,6})\s+(.+)$/.exec(line);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].replace(/\s+#+\s*$/, '').trim(),
        line: i
      });
    }
  }
  return headings;
}

function uniqueSlug(text, seen) {
  var base = slugify(text) || 'section';
  var slug = base;
  var n = 1;
  while (seen[slug]) {
    n += 1;
    slug = base + '-' + n;
  }
  seen[slug] = true;
  return slug;
}

function buildToc(headings, minLevel) {
  minLevel = minLevel || 2;
  var filtered = headings.filter(function (h) {
    return h.level >= minLevel;
  });
  if (!filtered.length) {
    return '';
  }
  var base = filtered[0].level;
  var lines = [];
  var seen = {};
  for (var i = 0; i < filtered.length; i++) {
    var h = filtered[i];
    var indent = new Array(Math.max(0, h.level - base) + 1).join('  ');
    var slug = uniqueSlug(h.text, seen);
    lines.push(indent + '- [' + h.text + '](#' + slug + ')');
  }
  return lines.join('\n');
}

function stripExistingToc(content) {
  var start = content.indexOf(TOC_START);
  if (start === -1) {
    return content;
  }
  var end = content.indexOf(TOC_END, start);
  if (end === -1) {
    return content.slice(0, start) + content.slice(start + TOC_START.length);
  }
  return content.slice(0, start) + content.slice(end + TOC_END.length);
}

function insertToc(content, tocBody) {
  var block = TOC_START + '\n' + tocBody + '\n' + TOC_END;
  if (content.indexOf(TOC_START) !== -1) {
    var start = content.indexOf(TOC_START);
    var end = content.indexOf(TOC_END, start);
    if (end === -1) {
      return content.slice(0, start) + block + content.slice(start + TOC_START.length);
    }
    return content.slice(0, start) + block + content.slice(end + TOC_END.length);
  }

  var lines = content.split(/\r?\n/);
  var insertAt = 0;
  if (lines[0] === '---') {
    for (var i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        insertAt = i + 1;
        break;
      }
    }
  }

  while (insertAt < lines.length && lines[insertAt].trim() === '') {
    insertAt++;
  }

  // Prefer placing TOC after the first H1
  for (var j = insertAt; j < lines.length; j++) {
    if (/^#\s+/.test(lines[j])) {
      insertAt = j + 1;
      break;
    }
  }

  lines.splice(insertAt, 0, '', block, '');
  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
}

function generate(filePath, options) {
  options = options || {};
  var content = fs.readFileSync(filePath, 'utf8');
  var withoutToc = stripExistingToc(content);
  var headings = extractHeadings(withoutToc);
  var tocBody = buildToc(headings, options.minLevel || 2);
  if (!tocBody) {
    return {
      content: content,
      changed: false,
      toc: ''
    };
  }
  var next = insertToc(withoutToc, tocBody);
  if (options.write !== false && next !== content) {
    fs.writeFileSync(filePath, next, 'utf8');
  }
  return {
    content: next,
    changed: next !== content,
    toc: tocBody
  };
}

function generateMany(target, options) {
  options = options || {};
  var files = utils.collectMarkdownFiles(target, options);
  var results = [];
  for (var i = 0; i < files.length; i++) {
    var generated = generate(files[i], options);
    results.push({
      file: files[i],
      content: generated.content,
      changed: generated.changed,
      toc: generated.toc
    });
  }
  return results;
}

module.exports = {
  generate: generate,
  generateMany: generateMany,
  extractHeadings: extractHeadings,
  buildToc: buildToc,
  slugify: slugify,
  TOC_START: TOC_START,
  TOC_END: TOC_END
};
