<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
  - Template Principle 1 -> I. Curated Home First
  - Template Principle 2 -> II. Presentation-Ready Content
  - Template Principle 3 -> III. Lightweight Maintainability
  - Template Principle 4 -> IV. Navigation and Discoverability
  - Template Principle 5 -> V. Public-Safe Practicality
- Added sections:
  - Content Boundaries & Curation
  - Working Practices
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ✅ README.md
- Follow-up TODOs:
  - None
-->
# cjdonaldson.github.io Constitution

## Core Principles

### I. Curated Home First
This repository MUST serve as the coherent home for curated camping, RV, and closely
related web-presentation content. Exploratory material MAY be committed while it is
being evaluated, but each retained item MUST have a clear status: ready for
publication, under evaluation, or kept as supporting reference. The rationale is
practical: this repo exists to reduce fragmentation across multiple repositories and
to keep useful camping and RV content together in one maintainable place.

### II. Presentation-Ready Content
Content committed for active use MUST be viewable, linkable, or otherwise
understandable from the site with lightweight tooling. Markdown, HTML, PDFs, images,
JSON, and small JavaScript helpers are acceptable; raw or draft material kept for
evaluation MUST be labeled and accompanied by an intended next step or destination.
This keeps the repository focused on usable web presentation instead of becoming an
unstructured file dump.

### III. Lightweight Maintainability
Changes MUST favor the lightest viable static-site approach: plain HTML, CSS,
JavaScript, Markdown, and simple data files unless heavier tooling is clearly
justified. Filenames, directories, and links MUST remain easy to inspect and update
without specialized build systems. The repo is a personal-ish, exploratory site, so
maintenance cost and clarity matter more than architectural complexity.

### IV. Navigation and Discoverability
Whenever curated content is added, renamed, moved, or retired, the relevant landing
pages, indexes, quick links, or supporting docs MUST be updated in the same change or
explicitly deferred with a documented follow-up note. Orphaned files MUST NOT
accumulate silently. The rationale is direct: if useful camping or RV material cannot
be found from the site, the repository is not fulfilling its purpose.

### V. Public-Safe Practicality
Committed content MUST be safe to publish from a personal public site: no secrets,
private personal data, or unreviewed copyrighted material. Large binary assets MUST
only remain when they clearly support usability, reference value, or site
completeness. External links, contact details, and trip or maintenance references
MUST receive a basic accuracy review before publication so the collection stays useful
without creating privacy, trust, or maintenance problems.

## Content Boundaries & Curation

- In scope: camping itineraries, RV setup and maintenance references, campground and
  site-map assets, lightweight planners or presentation tools, and documentation that
  directly supports the web presentation of that material.
- Evaluation-stage files are allowed when they are plausibly headed toward publication
  in this repo and their status is discoverable from surrounding docs, page links, or
  planning notes.
- Out of scope: unrelated experiments with no credible connection to the site,
  duplicate copies better maintained elsewhere, and sensitive records that should not
  be publicly published.
- New files and directories MUST either fit the existing structure or include a brief
  reason for introducing a new structure.

## Working Practices

- Each meaningful change MUST state its purpose, intended audience, target home within
  the repo, and how a reader will reach it.
- Content that is ready for general use MUST be linked from an appropriate page,
  collection, or index unless a documented exception explains why it is intentionally
  hidden.
- Validation MUST match the repo's static-site reality: open the affected pages,
  verify key links and assets load, and spot-check that the presentation remains
  understandable on the web.
- When a file is kept under evaluation, the change MUST record the next expected
  action rather than leaving the file as an unexplained orphan.
- Prefer incremental commits that fold resolved content into this repository over
  leaving long-lived material scattered across multiple repos or unmanaged local
  storage.

## Governance

- This constitution supersedes conflicting local habits and serves as the review
  baseline for content, structure, and workflow decisions in this repository.
- Amendments MUST update this file and any affected templates or guidance docs in the
  same change, including a refreshed Sync Impact Report at the top of the
  constitution.
- Versioning follows semantic versioning for governance changes:
  - MAJOR: removal or incompatible redefinition of a principle or governance rule
  - MINOR: a new principle, a new required section, or materially expanded guidance
  - PATCH: clarifications, wording improvements, or non-semantic refinements
- Compliance review MUST confirm, before merge or publication, that the change fits
  repo scope, preserves discoverability, remains lightweight to maintain, and is safe
  for public hosting.
- Large content imports, structural reorganizations, or repeated exceptions to these
  rules MUST trigger an explicit constitution compliance review during the change.

**Version**: 1.0.0 | **Ratified**: 2026-03-12 | **Last Amended**: 2026-03-12
