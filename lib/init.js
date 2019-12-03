'use strict';

var fs = require('fs');
var path = require('path');

var TEMPLATE = [
  '---',
  'title: Notes',
  'created: DATE',
  '---',
  '',
  '# Notes',
  '',
  '<!-- toc -->',
  '<!-- tocstop -->',
  '',
  '## Overview',
  '',
  'Write your notes here.',
  '',
  '## Details',
  '',
  'Add more sections as needed.',
  ''
].join('\n');

function scaffold(targetDir, options) {
  options = options || {};
  var dir = path.resolve(targetDir || 'docs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  var file = path.join(dir, 'index.md');
  if (fs.existsSync(file) && !options.force) {
    return {
      created: false,
      path: file,
      message: 'already exists: ' + file
    };
  }
  var body = TEMPLATE.replace('DATE', new Date().toISOString().slice(0, 10));
  if (options.write !== false) {
    fs.writeFileSync(file, body, 'utf8');
  }
  return {
    created: true,
    path: file,
    content: body,
    message: 'created ' + file
  };
}

module.exports = {
  scaffold: scaffold,
  TEMPLATE: TEMPLATE
};
