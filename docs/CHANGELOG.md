# Changelog

All notable changes to the Deep Focus project should be documented in this file.

This changelog provides a chronological record of significant project updates and helps developers, contributors, and future users understand how Deep Focus has evolved over time.

The format is inspired by Keep a Changelog principles and adapted to the needs of the Deep Focus project.

The changelog should record completed and meaningful changes rather than planned or speculative work.

---

## Versioning

---

Deep Focus intends to use Semantic Versioning principles for public releases where appropriate.

Version numbers generally follow the format:

`MAJOR.MINOR.PATCH`

Examples:

- `1.0.0`
- `1.1.0`
- `1.1.1`

In general:

- `MAJOR` represents significant incompatible or major product changes
- `MINOR` represents backward-compatible functionality or meaningful feature additions
- `PATCH` represents backward-compatible fixes and smaller corrections

Before the first stable public release, versioning may remain flexible while the product and release process are still evolving.

Version numbers should communicate meaningful differences between releases as clearly and consistently as practical.

---

## Change Categories

---

Changes may be recorded under the following categories:

- Added
- Changed
- Improved
- Fixed
- Removed
- Deprecated
- Security

### Added

Used for new functionality, capabilities, or significant project additions.

### Changed

Used when existing behavior, architecture, workflows, or requirements change meaningfully.

### Improved

Used as a Deep Focus project convention for meaningful enhancements that do not clearly represent entirely new functionality or defect fixes.

### Fixed

Used for resolved defects or incorrect behavior.

### Removed

Used for functionality, files, APIs, or supported behavior that has been removed.

### Deprecated

Used for functionality that remains available but is planned for future removal or replacement.

### Security

Used for meaningful security-related changes or fixes that are appropriate to document publicly.

Not every category needs to appear in every release.

Empty categories should be omitted from finalized release entries.

---

## Unreleased

---

The `Unreleased` section contains notable completed changes that have not yet been included in a public release.

Only work that has actually been completed should be recorded here.

### Added

- Initial project documentation
- Project vision
- Product blueprint
- UI/UX design specification
- Component library
- AI development rules
- Architecture documentation
- Development guide
- Contribution guide
- Testing strategy
- Initial changelog structure
- EAS development, preview, production, and submission configuration
- Added the initial shared design-token foundation for colors, typography, spacing, radii, shadows, opacity, motion, and layout.

### Changed

- Renamed the application configuration and package metadata from MyFirstApp to Deep Focus
- Replaced the experimental session setup entry screen with the Phase 0 Deep Focus home  screen
- Simplified web navigation to the active Home route

### Removed

- Removed obsolete Explore, Focus, Summary, and legacy index prototype routes


### Improved

- Improved project documentation structure and consistency
- Refined documentation for maintainability and future scalability
- Strengthened accessibility guidance
- Strengthened privacy and security guidance
- Refined AI behavior and development guidance
- Expanded development and contribution standards
- Expanded testing, compatibility, performance, release, and defect-management guidance

---

## Release Guidelines

---

Every public release should be represented in this changelog.

Each release entry should include, where applicable:

- Version number
- Release date
- Significant user-visible changes
- Important internal changes
- Added functionality
- Changed functionality
- Meaningful improvements
- Bug fixes
- Removed functionality
- Deprecated functionality
- Security-related updates

Release notes should remain:

- Clear
- Concise
- Accurate
- Factual
- Easy to understand

Changelog entries should describe what changed rather than provide unnecessary implementation detail.

Features that are planned but not completed should not be recorded as released functionality.

---

## Version History

---

Released versions should appear below `Unreleased`.

The newest released version should appear first.

Example:

```text
## [1.0.0] - YYYY-MM-DD

### Added

- Added Feature A.
- Added Feature B.

### Changed

- Updated existing application behavior.

### Improved

- Improved application performance.

### Fixed

- Fixed a notification issue.

### Removed

- Removed deprecated functionality.

### Deprecated

- Deprecated legacy functionality scheduled for future removal.

### Security

- Improved authentication handling.
```

Categories without relevant changes should be omitted.

Release dates should use a consistent format:

`YYYY-MM-DD`

Released entries should not normally be modified after publication except to correct inaccurate information.

Material corrections to historical entries should preserve the accuracy of the project history.

---

## Pre-Release Versions

---

Before Deep Focus reaches its first stable public release, pre-release versions may be used where appropriate.

Examples may include:

- `0.1.0`
- `0.2.0`
- `1.0.0-alpha.1`
- `1.0.0-beta.1`
- `1.0.0-rc.1`

Pre-release identifiers should only be introduced when they provide useful meaning to the development or release process.

The project does not need to create version numbers for every internal development change.

---

## Release Process

---

Before publishing a new release:

- Complete the intended release scope
- Complete appropriate testing and validation
- Resolve release-blocking defects
- Review relevant documentation
- Update the application version where required
- Review the `Unreleased` section
- Move applicable completed entries into the new release section
- Add the release version and date
- Remove empty categories
- Review the changelog for accuracy
- Create the appropriate Git release tag
- Publish release notes where applicable

After creating a release, the `Unreleased` section should remain available for subsequent completed changes.

A public release should represent a version that has completed the verification appropriate to its intended scope.

---

## Release Tags

---

Public release tags should correspond clearly with application versions.

A consistent tag format should be used, such as:

```text
v1.0.0
v1.1.0
v1.1.1
```

Pre-release tags may follow the corresponding version identifier where applicable.

Examples:

```text
v1.0.0-beta.1
v1.0.0-rc.1
```

Tags should reference the commit representing the intended release state.

Release tags should not be created for ordinary documentation or development commits.

---

## Documentation Updates

---

Significant documentation changes may be recorded when they materially affect:

- Project direction
- Product requirements
- Architecture
- Development standards
- Testing requirements
- Contributor expectations
- Security or privacy guidance
- Accessibility requirements
- AI behavior or development rules
- Release processes

Minor editorial changes, formatting corrections, and typo fixes generally do not need individual changelog entries unless they materially change project understanding.

Documentation entries should describe completed documentation changes accurately.

---

## Change Recording Principles

---

Every recorded change should:

- Be accurate
- Represent completed work
- Be concise and understandable
- Describe user-visible impact when applicable
- Describe significant internal or documentation changes when relevant
- Avoid unnecessary implementation detail
- Avoid duplicate entries
- Avoid speculative future functionality
- Use the most appropriate change category
- Remain understandable without requiring commit-history investigation

The changelog should not function as:

- A project roadmap
- A complete commit log
- A task tracker
- A list of every modified file
- A record of insignificant editorial changes

Git history should preserve implementation-level change history, while the changelog should preserve meaningful release-level project history.

---

## Changelog Maintenance

---

The changelog should be updated as meaningful work is completed rather than reconstructed entirely at release time.

Before a release, contributors should verify that:

- Relevant completed changes are represented
- Planned but incomplete work is excluded
- Duplicate entries are removed
- Categories are accurate
- Descriptions reflect actual implementation
- Security-sensitive details are not unnecessarily exposed
- Historical release information remains accurate

Changelog maintenance should remain lightweight and proportional to the scale of the project.

---

## Conclusion

---

This changelog serves as the historical record of significant changes made to Deep Focus.

Maintaining an accurate changelog helps developers, contributors, and future users understand the evolution of the application while improving transparency and release traceability.

A well-maintained changelog should provide:

- Clear version history
- Accurate change records
- Consistent release documentation
- Reliable release notes
- Useful historical context
- Long-term project traceability

The changelog should remain concise, factual, maintainable, and synchronized with completed project work.

As Deep Focus evolves, changelog practices may evolve with the release process while preserving the principles of accuracy, clarity, and meaningful historical documentation.

---