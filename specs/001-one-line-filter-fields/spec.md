# Feature Specification: One-Line Filter Fields

**Feature Branch**: `[001-one-line-filter-fields]`
**Created**: 2026-03-15
**Status**: Complete
**Input**: User description: "one line filter fields"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan filter controls together (Priority: P1)

As a traveler using the Florida Bound route planner, I want the `Filter by` and `Max value` fields to appear on one line so I can review and adjust the related filter settings together without extra visual scanning.

**Why this priority**: This is the entire requested outcome and directly improves the usability of the existing planner controls without changing route-planning behavior.

**Independent Test**: Open `camping/florida-bound-planner.html`, add or view a planner, and confirm the `Filter by` label and field plus the `Max value` label and field are displayed on a single horizontal line in that order.

**Acceptance Scenarios**:

1. **Given** a planner is visible, **When** the user reviews the filtering controls, **Then** the `Filter by` field and the `Max value` field appear on one line, with `Filter by` first and `Max value` second.
2. **Given** the user changes either filter field, **When** the planner remains visible, **Then** both filter fields stay on the same line and remain easy to read.

---

### User Story 2 - Keep layout consistent across planners (Priority: P2)

As a maintainer reviewing the planner page, I want each planner instance to keep the filter fields on one line so the page stays consistent when multiple planners are open.

**Why this priority**: The page supports multiple planners, so the layout change should remain consistent rather than only working for the first planner instance.

**Independent Test**: Open `camping/florida-bound-planner.html`, create multiple planners, and confirm each planner shows the `Filter by` and `Max value` fields on one line in the same order.

**Acceptance Scenarios**:

1. **Given** more than one planner is shown on the page, **When** the user compares their controls, **Then** each planner displays `Filter by` and `Max value` on one line in the same order.
2. **Given** a planner is added or removed, **When** the page updates, **Then** the remaining planners continue to show the two filter fields on one line.

### Edge Cases

- If the planner is displayed in a narrow available width, the two filter fields should still remain visually grouped as one row rather than being separated by unrelated controls.
- If multiple planners are open at once, each planner should preserve the same field order and single-line presentation independently.
- If the page is refreshed or a planner is added after initial load, the filter fields should still render on one line.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Florida Bound route planner MUST present the `Filter by` field and the `Max value` field as a single row of related controls.
- **FR-002**: The single-row presentation MUST place `Filter by` before `Max value`.
- **FR-003**: The planner MUST preserve the existing purpose of both fields while changing only their presentation.
- **FR-004**: Every planner instance on `camping/florida-bound-planner.html` MUST use the same one-line filter-field layout.
- **FR-005**: Adding, removing, or updating a planner MUST NOT break the one-line presentation of the two filter fields.
- **FR-006**: The updated planner page, its supporting script, and its supporting stylesheet MUST remain ready for publication as part of the existing Florida Bound planner experience.

### Content & Curation Requirements

> **NFR-C1** — Publish readiness: The affected published assets (the Florida Bound planner page and its supporting planner-rendering files) must remain ready for publication after every change.
> **NFR-C2** — Discovery path: Users reach this feature on the existing `camping/florida-bound-planner.html` page; no new navigation surface is required.
> **NFR-C3** — Asset hygiene: No new private data, large assets, or copyright-sensitive materials are introduced by this feature.

### Key Entities *(include if feature involves data)*

- **Planner Instance**: A single route-planner panel shown on the page, including its own filter controls.
- **Filter Field Row**: The paired `Filter by` and `Max value` controls as one visual unit within a planner instance.

### Assumptions

- The requested scope is limited to layout and ordering of the existing filter fields, not to changing their filtering logic or adding new controls.
- The relevant filter fields are the existing `Filter by` and `Max value` controls shown in the Florida Bound route planner.
- Keeping the fields "one line" means they appear as one horizontal row within a planner instance under normal page use and after common planner interactions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual review, 100% of visible planner instances show `Filter by` and `Max value` on one horizontal line, with `Filter by` first.
- **SC-002**: In manual review after adding and removing planners, 100% of remaining planner instances retain the same one-line filter-field layout.
- **SC-003**: In manual review, the two filter fields remain readable and visually grouped together before and after changing their values.
- **SC-004**: The updated planner page continues to present the filtering controls without requiring users to search across multiple lines for these two related fields.
