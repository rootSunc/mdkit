'use strict';

var fs = require('fs');
var path = require('path');

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

function countWords(text) {
  var body = stripFrontMatter(text);
  var withoutCode = stripCodeBlocks(body);
  var cjk = withoutCode.match(/[\u4e00-\u9fff]/g);
  var cjkCount = cjk ? cjk.join('').length : 0;
  var latin = withoutCode
    .replace(/[\u4e00-\u9fff]/g, ' ')
    .replace(/[^\w\s'-]/g, ' ')
    .trim();
  var latinCount = latin ? latin.split(/\s+/).filter(Boolean).length : 0;
  return cjkCount + latinCount;
}

function countHeadings(text) {
  var body = stripFrontMatter(text);
  var withoutCode = stripCodeBlocks(body);
  var matches = withoutCode.match(/^#{1,6}\s+.+$/gm);
  return matches ? matches.length : 0;
}

function countCodeBlocks(text) {
  var body = stripFrontMatter(text);
  var matches = body.match(/```/g);
  if (!matches) {
    return 0;
  }
  return Math.floor(matches.length / 2);
}

function analyzeFile(filePath) {
  var content = fs.readFileSync(filePath, 'utf8');
  return {
    file: filePath,
    words: countWords(content),
    headings: countHeadings(content),
    codeBlocks: countCodeBlocks(content),
    lines: content.split(/\r?\n/).length,
    bytes: Buffer.byteLength(content, 'utf8')
  };
}

function collectMarkdownFiles(target) {
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
    var full = path.join(target, entries[i]);
    var st = fs.statSync(full);
    if (st.isDirectory()) {
      results = results.concat(collectMarkdownFiles(full));
    } else if (/\.(md|markdown)$/i.test(entries[i])) {
      results.push(full);
    }
  }
  return results;
}

function analyze(target) {
  var files = collectMarkdownFiles(target);
  var items = files.map(analyzeFile);
  var summary = {
    files: items.length,
    words: 0,
    headings: 0,
    codeBlocks: 0,
    lines: 0,
    bytes: 0
  };
  for (var i = 0; i < items.length; i++) {
    summary.words += items[i].words;
    summary.headings += items[i].headings;
    summary.codeBlocks += items[i].codeBlocks;
    summary.lines += items[i].lines;
    summary.bytes += items[i].bytes;
  }
  return {
    items: items,
    summary: summary
  };
}

function formatReport(result) {
  var lines = [];
  for (var i = 0; i < result.items.length; i++) {
    var item = result.items[i];
    lines.push(
      item.file +
        '\n  words: ' +
        item.words +
        '\n  headings: ' +
        item.headings +
        '\n  code blocks: ' +
        item.codeBlocks +
        '\n  lines: ' +
        item.lines
    );
  }
  if (result.items.length > 1) {
    var s = result.summary;
    lines.push(
      '\nTotal (' +
        s.files +
        ' files)\n  words: ' +
        s.words +
        '\n  headings: ' +
        s.headings +
        '\n  code blocks: ' +
        s.codeBlocks +
        '\n  lines: ' +
        s.lines
    );
  }
  return lines.join('\n');
}

module.exports = {
  analyze: analyze,
  analyzeFile: analyzeFile,
  countWords: countWords,
  countHeadings: countHeadings,
  countCodeBlocks: countCodeBlocks,
  formatReport: formatReport,
  collectMarkdownFiles: collectMarkdownFiles
};
