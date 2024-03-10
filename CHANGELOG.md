# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2024/03/10
### Changed
- Update dependency on @s4tk/models to 0.6.14 (new tuning/SimData types)

## [0.3.1] - 2023/10/01
### Changed
- Update dependency on @s4tk/models to 0.6.10 (new tuning/SimData types)

## [0.3.0] - 2023/07/21
### Added
- Added the `insertGroupComment` and `useTuningFoldersForSimData` options to `ExtractionOptions`.
- New naming conventions:
  - `s4pi` = Same as the old `tgi-name` naming convention (`S4_TTTTTTTT_GGGGGGGG_IIIIIIIIIIIIIIII.filename.xml`)
  - `tgi-only` = Same as the old `tgi` naming convention, minus the `S4` prefix (`TTTTTTTT_GGGGGGGG_IIIIIIIIIIIIIIII.xml`)
### Changed
- When the new `useTuningFoldersForSimData` option is true, the "SimData" subfolder will no longer be generated.
- Changed naming conventions:
  - `tgi-name` = No longer includes the `S4` prefix (`TTTTTTTT_GGGGGGGG_IIIIIIIIIIIIIIII.filename.xml`)
### Removed
- Removed naming conventions:
  - `tgi` = Replaced by approximate equal of `tgi-only` (see **Added**)

## [0.2.2] - 2023/07/19
### Fixed
- Update dependency on @s4tk/models to fix issue where 'n' attribute doesn't always appear first.

## [0.2.1] - 2023/06/23
### Added
- Added support for XML string/tuning manifests.
### Changed
- SimData files are now written with the `.SimData.xml` extension.
- Manifests now enforce "properties", "json", or "xml" types.
### Fixed
- Fixed issue where strings whose keys start with "0x0" would not be mapped.

## [0.2.0] - 2023/05/23
### Added
- Added support for indexing SDX packages (must add folders to srcDirs though).
### Changed
- Update dependencies on @s4tk/models and glob.
### Fixed
- Fixed potential issues with globbing on Windows.

## [0.1.3] - 2022/07/29
### Changed
- Update dependency on @s4tk/models and use @s4tk/plugin-bufferfromfile.

## [0.1.2] - 2022/06/06
### Fixed
- Emit SimData start/end events.

## [0.1.1] - 2022/06/05
### Added
- Add `loadStringMap()` and `loadTuningMap()` to API.
### Fixed
- Now works on Windows.

## [0.1.0] - 2022/06/04
### Added
- First release.
