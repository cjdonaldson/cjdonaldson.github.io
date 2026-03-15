---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include validation tasks. Automated tests are OPTIONAL - include them only when requested or when they materially reduce risk. Manual browser review, link checks, and asset verification are valid tests for this repo type.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines instead of space-based Markdown line breaks. -->

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Static content area**: `camping/`, `camping/docs/`, `camping/site-map/`
- **Root-level pages/docs**: `README.md`, `index.html`, `docs/`
- **Interactive static pages**: `camping/*.html`, `camping/*.js`, `camping/*.css`, `camping/*.json`
- Paths shown below assume a static-site/content repository - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inventory the affected content and prepare the target structure

- [ ] T001 Inventory affected files, links, and assets per implementation plan
- [ ] T002 Confirm target paths and page locations for curated content
- [ ] T003 [P] Prepare any lightweight HTML/CSS/JS/Markdown scaffolding needed for the change

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared prerequisites that MUST be complete before user-story work begins

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Establish or confirm destination sections in affected index or landing pages
- [ ] T005 [P] Prepare shared styling, small scripts, or data files used by multiple stories
- [ ] T006 [P] Create folders for new curated docs or assets when required
- [ ] T007 Document evaluation status for files not yet ready for full publication
- [ ] T008 Create a validation checklist for links, asset loads, and page readability
- [ ] T009 Review any privacy, licensing, or asset-size concerns for imported content

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Validation for User Story 1 (OPTIONAL but recommended) ⚠️

> **NOTE: Define validation before implementation so success is easy to confirm**

- [ ] T010 [P] [US1] Add or document manual review steps for [page/journey]
- [ ] T011 [P] [US1] Add optional automated link or rendering check for [page/asset]

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create or update source content in camping/[file].md
- [ ] T013 [P] [US1] Add or update supporting asset in camping/[asset]
- [ ] T014 [US1] Update landing page or section in camping/[page].html
- [ ] T015 [US1] Add or update lightweight styling or script in camping/[file].css or camping/[file].js
- [ ] T016 [US1] Add navigation, labels, or status notes for the new content
- [ ] T017 [US1] Run and record the planned validation for user story 1

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Validation for User Story 2 (OPTIONAL but recommended) ⚠️

- [ ] T018 [P] [US2] Document manual review steps for [page/journey]
- [ ] T019 [P] [US2] Add optional automated link or asset verification for [page/file]

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create or revise curated content in camping/[file].md or camping/[file].html
- [ ] T021 [US2] Update index, quick links, or supporting docs for discoverability
- [ ] T022 [US2] Add supporting asset, data file, or page behavior in camping/[file]
- [ ] T023 [US2] Validate integration with User Story 1 navigation and content flow

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Validation for User Story 3 (OPTIONAL but recommended) ⚠️

- [ ] T024 [P] [US3] Document manual review steps for [page/journey]
- [ ] T025 [P] [US3] Add optional automated link or rendering verification for [page/file]

### Implementation for User Story 3

- [ ] T026 [P] [US3] Add or update content/assets in the target curated location
- [ ] T027 [US3] Update relevant presentation page, docs, or data file
- [ ] T028 [US3] Validate that the new content remains lightweight, discoverable, and public-safe

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in README.md, docs/, or camping/docs/
- [ ] TXXX Clean up unused links, notes, or orphaned draft references
- [ ] TXXX Review page readability, accessibility, and responsive behavior
- [ ] TXXX [P] Add optional automated checks or additional manual validation notes
- [ ] TXXX Review privacy, licensing, and large-asset impacts across the change
- [ ] TXXX Validate final navigation paths from landing pages to curated content

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Validation steps SHOULD be defined before implementation
- Content updates before navigation wiring is finalized
- Navigation updates before final validation
- Core content before polish and supporting enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All validation tasks for a user story marked [P] can run in parallel
- Content or asset tasks within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all validation tasks for User Story 1 together:
Task: "Document manual review for camping/[page].html"
Task: "Run optional link or asset verification for camping/[file]"

# Launch all content tasks for User Story 1 together:
Task: "Update curated content in camping/[file].md"
Task: "Add supporting asset in camping/[asset]"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and reviewable
- Define validation before implementing when practical
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
