# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., HTML5, CSS3, vanilla JS, Markdown or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., browser APIs, zero-build tooling, small JS library if justified]  
**Content Sources**: [e.g., existing camping/ files, new curated references, external data or NEEDS CLARIFICATION]  
**Testing/Validation**: [e.g., manual browser review, link checks, asset load checks, optional scripted validation]  
**Target Platform**: [e.g., GitHub Pages, static browsers, mobile + desktop browsers]
**Project Type**: [e.g., static site, content collection, lightweight planner, reference docs]  
**Performance Goals**: [e.g., fast page loads, readable pages, reasonable asset size or NEEDS CLARIFICATION]  
**Constraints**: [e.g., lightweight maintenance, public-safe content, minimal dependencies]  
**Scale/Scope**: [e.g., affected pages, assets, itineraries, or docs in this change]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] The change directly supports curated camping, RV, or adjacent site content, or
      clearly improves presentation of that content.
- [ ] Each new or changed file has a defined long-term home and status: published,
      under evaluation, or supporting reference.
- [ ] Navigation and discoverability updates are identified for all curated content
      changes.
- [ ] The solution uses the lightest viable static-site approach; any heavier tooling
      is explicitly justified.
- [ ] Privacy, licensing, and large-asset implications have been reviewed.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Static content collection (DEFAULT)
camping/
├── index.html
├── *.html
├── *.md
├── *.json
├── docs/
└── site-map/

# [REMOVE IF UNUSED] Option 2: Root-level site pages + content area
README.md
index.html
assets/
camping/
docs/

# [REMOVE IF UNUSED] Option 3: Lightweight interactive pages
camping/
├── index.html
├── planner.html
├── *.js
├── *.css
└── data/
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., new build dependency] | [specific presentation or curation need] | [why plain HTML/CSS/JS was insufficient] |
| [e.g., unlinked evaluation asset] | [temporary review need] | [why immediate integration is not yet appropriate] |
