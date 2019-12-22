'use strict';

var fs = require('fs');
var toc = require('./toc');
var utils = require('./utils');

function listFile(filePath) {
  var content = fs.readFileSync(filePath, 'utf8');
  var headings = toc.extractHeadings(content);
  var seen = {};
  return headings.map(function (h) {
    var base = toc.slugify(h.text) || 'section';
    var slug = base;
    var n = 1;
    while (seen[slug]) {
      n += 1;
      slug = base + '-' + n;
    }
    seen[slug] = true;
    return {
      file: filePath,
      level: h.level,
      text: h.text,
      slug: slug,
      line: h.line + 1
    };
  });
}

function list(target, options) {
  var files = utils.collectMarkdownFiles(target, options);
  var items = [];
  for (var i = 0; i < files.length; i++) {
    items = items.concat(listFile(files[i]));
  }
  return {
    files: files.length,
    items: items
  };
}

function formatReport(result) {
  if (!result.items.length) {
    return 'No headings found in ' + result.files + ' file(s).';
  }
  var lines = [];
  for (var i = 0; i < result.items.length; i++) {
    var item = result.items[i];
    lines.push(
      item.file +
        ':' +
        item.line +
        '  h' +
        item.level +
        '  #' +
        item.slug +
        '  ' +
        item.text
    );
  }
  return lines.join('\n');
}

module.exports = {
  list: list,
  listFile: listFile,
  formatReport: formatReport
};
