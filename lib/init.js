'use strict';

var fs = require('fs');
var path = require('path');

var TEMPLATES = {
  notes: [
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
  ].join('\n'),
  blog: [
    '---',
    'title: Untitled Post',
    'date: DATE',
    'tags: draft',
    '---',
    '',
    '# Untitled Post',
    '',
    '<!-- toc -->',
    '<!-- tocstop -->',
    '',
    '## Intro',
    '',
    'Start writing your post.',
    '',
    '## Body',
    '',
    'More content goes here.',
    ''
  ].join('\n'),
  changelog: [
    '---',
    'title: Changelog',
    '---',
    '',
    '# Changelog',
    '',
    '## Unreleased',
    '',
    '- TBD',
    '',
    '## DATE',
    '',
    '- Initial version',
    ''
  ].join('\n')
};

var TEMPLATE = TEMPLATES.notes;

function scaffold(targetDir, options) {
  options = options || {};
  var dir = path.resolve(targetDir || 'docs');
  var templateName = options.template || 'notes';
  var template = TEMPLATES[templateName];
  if (!template) {
    return {
      created: false,
      path: null,
      message: 'unknown template: ' + templateName + ' (notes|blog|changelog)'
    };
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  var fileName = templateName === 'changelog' ? 'CHANGELOG.md' : 'index.md';
  var file = path.join(dir, fileName);
  if (fs.existsSync(file) && !options.force) {
    return {
      created: false,
      path: file,
      message: 'already exists: ' + file
    };
  }
  var body = template.replace(/DATE/g, new Date().toISOString().slice(0, 10));
  if (options.write !== false) {
    fs.writeFileSync(file, body, 'utf8');
  }
  return {
    created: true,
    path: file,
    content: body,
    template: templateName,
    message: 'created ' + file
  };
}

module.exports = {
  scaffold: scaffold,
  TEMPLATE: TEMPLATE,
  TEMPLATES: TEMPLATES
};
