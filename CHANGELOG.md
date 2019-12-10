# Changelog

All notable changes to this project are documented in this file.

## 0.2.0 - 2020-11-14

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

## 0.1.0 - 2020-03-05

### Added
- Initial CLI with `stats`, `toc`, `fm`, and `links`
