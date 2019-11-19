'use strict';

var fs = require('fs');

function parse(content) {
  if (content.indexOf('---\n') !== 0 && content.indexOf('---\r\n') !== 0) {
    return {
      attributes: {},
      body: content,
      hasFrontMatter: false
    };
  }

  var end = content.indexOf('\n---', 4);
  if (end === -1) {
    return {
      attributes: {},
      body: content,
      hasFrontMatter: false
    };
  }

  var raw = content.slice(4, end).replace(/^\r/, '');
  var body = content.slice(end + 4).replace(/^\r?\n/, '');
  var attributes = {};
  var lines = raw.split(/\r?\n/);

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line || line.charAt(0) === '#') {
      continue;
    }
    var idx = line.indexOf(':');
    if (idx === -1) {
      continue;
    }
    var key = line.slice(0, idx).trim();
    var value = line.slice(idx + 1).trim();
    if (
      (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') ||
      (value.charAt(0) === "'" && value.charAt(value.length - 1) === "'")
    ) {
      value = value.slice(1, -1);
    }
    attributes[key] = value;
  }

  return {
    attributes: attributes,
    body: body,
    hasFrontMatter: true
  };
}

function stringify(attributes, body) {
  var keys = Object.keys(attributes);
  var lines = ['---'];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = attributes[key];
    if (value === undefined || value === null) {
      continue;
    }
    var text = String(value);
    if (/[:#\n]/.test(text) || /^\s|\s$/.test(text)) {
      text = '"' + text.replace(/"/g, '\\"') + '"';
    }
    lines.push(key + ': ' + text);
  }
  lines.push('---');
  var fm = lines.join('\n');
  if (!body) {
    return fm + '\n';
  }
  if (body.charAt(0) === '\n') {
    return fm + body;
  }
  return fm + '\n' + body;
}

function readFile(filePath) {
  var content = fs.readFileSync(filePath, 'utf8');
  return parse(content);
}

function get(filePath, key) {
  var parsed = readFile(filePath);
  if (!key) {
    return parsed.attributes;
  }
  return parsed.attributes[key];
}

function set(filePath, key, value, options) {
  options = options || {};
  var content = fs.readFileSync(filePath, 'utf8');
  var parsed = parse(content);
  var attributes = parsed.attributes;
  if (value === undefined || value === null || value === '') {
    delete attributes[key];
  } else {
    attributes[key] = value;
  }
  var next = stringify(attributes, parsed.body);
  if (options.write !== false) {
    fs.writeFileSync(filePath, next, 'utf8');
  }
  return {
    attributes: attributes,
    content: next,
    changed: next !== content
  };
}

module.exports = {
  parse: parse,
  stringify: stringify,
  readFile: readFile,
  get: get,
  set: set
};
