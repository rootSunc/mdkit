# mdkit

A lightweight Node.js CLI for everyday Markdown tasks: table of contents, front matter, local link checks, document stats, and a tiny docs scaffold.

[![Build Status](https://travis-ci.org/rootSunc/mdkit.svg?branch=master)](https://travis-ci.org/rootSunc/mdkit)

## Install

```bash
npm install -g mdkit
```

Or run from this repository:

```bash
npm install
npm start
node bin/mdkit.js --help
```

Requires Node.js 10+.

## Commands

### `mdkit stats <path>`

Count words (Latin + CJK), headings, code blocks, and lines for a file or directory.

```bash
mdkit stats ./docs
mdkit stats README.md --json
mdkit stats . --ignore vendor,tmp
```

### `mdkit toc <path>`

Generate or refresh a table of contents. Uses `<!-- toc -->` / `<!-- tocstop -->` markers. Accepts a file or directory.

```bash
mdkit toc examples/demo.md
mdkit toc ./docs --dry-run
mdkit toc notes.md --stdout
mdkit toc notes.md --min-level 2
```

### `mdkit fm <file>`

Read or update simple YAML front matter (`key: value` pairs).

```bash
mdkit fm post.md
mdkit fm post.md --get title
mdkit fm post.md --set title="Hello"
mdkit fm post.md --delete draft --dry-run
```

### `mdkit links <path>`

Check whether relative local links resolve on disk. External URLs and `#anchors` are ignored. Exits with code `1` when broken links are found.

```bash
mdkit links ./docs
mdkit links examples/demo.md --json
```

### `mdkit init [dir]`

Scaffold a starter notes directory (defaults to `docs/`).

```bash
mdkit init
mdkit init notes --force
```

## Example workflow

```bash
mdkit init docs
mdkit fm docs/index.md --set status=draft
mdkit toc docs --dry-run
mdkit toc docs
mdkit stats docs --json
mdkit links docs
```

## Project layout

```text
bin/mdkit.js     CLI entry
lib/             command implementations
test/            mocha tests and fixtures
examples/        sample Markdown
```

## Test

```bash
npm test
```

## License

MIT
