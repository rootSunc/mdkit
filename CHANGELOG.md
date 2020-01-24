# Changelog

All notable changes to this project are documented in this file.

## 0.3.0 - 2020-01-20

### Added
- Reading time estimates in `stats`
- `toc --max-level` and `toc --remove`
- `headings` command for outline + slug listing
- `fm --json`
- `init --template notes|blog|changelog`
- `stats --summary`
- Image link detection and optional `--anchors` checks

### Changed
- Inline code is excluded from word counts

## 0.2.0 - 2019-12-10

### Added
- `mdkit init` to scaffold a starter notes directory
- `--json` output for `stats` and `links`
- `--ignore` for directory scans
- Directory support for `toc`
- `--dry-run` for `toc` and `fm`
- Travis CI configuration for Node 10/12/14

### Fixed
- Ignore maps are no longer re-parsed incorrectly
- Duplicate heading titles produce unique TOC anchors

### Changed
- Shared Markdown helpers live in `lib/utils.js`

## 0.1.0 - 2019-11-17

### Added
- Initial CLI with `stats`, `toc`, `fm`, and `links`
