'use strict';

var fs = require('fs');
var utils = require('./utils');

function countWords(text) {
  var body = utils.stripFrontMatter(text);
  var withoutCode = utils.stripCodeBlocks(body);
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
  var body = utils.stripFrontMatter(text);
  var withoutCode = utils.stripCodeBlocks(body);
  var matches = withoutCode.match(/^#{1,6}\s+.+$/gm);
  return matches ? matches.length : 0;
}

function countCodeBlocks(text) {
  var body = utils.stripFrontMatter(text);
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

function collectMarkdownFiles(target, options) {
  return utils.collectMarkdownFiles(target, options);
}

function analyze(target, options) {
  var files = collectMarkdownFiles(target, options);
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
