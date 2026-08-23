# Copilot instructions for cjdonaldson.github.io

Purpose: Provide Copilot CLI and agent guidance tailored to this repository so future sessions can act reliably.

## Build / Test / Lint
- No build system or test runner is configured in repo root; the site is static HTML/CSS/vanilla JS.
- Node.js utilities:
  - Generate a location id: `node location-id-gen.js "27.1392,-82.4526"` or `./location-id-gen.js "27.1392,-82.4526"` (make executable)
  - Validate locations JSON: `node validate-ids.js path/to/locations.json` (exits non‑zero on failure)
- Quick local server: `python -m http.server 4000` and open `http://localhost:4000`.

## High-level architecture
- Static site served from repository root; interactive planner and related pages live under `/camping/`.
- Spec-driven workflow for features:
  - `specs/` holds numbered feature directories `NNN-short-name`.
  - `.specify/` contains templates and scripts used by speckit agents to create/manage specs.
- Lightweight Node CLIs (single-file) provide tooling for data validation and id generation.
- Copilot/speckit agents and prompts live in `.github/agents/` and `.github/prompts/`.

## Key conventions
- Branch naming: features use a zero-padded 3-digit prefix and a short name, e.g. `005-user-auth` (scripts expect this format).
- Feature creation: use speckit agents or the create script to ensure consistent branch/spec layout:
  - Script: `.specify/scripts/bash/create-new-feature.sh --json "Feature description"`
  - Agent: `/agent speckit.specify <feature description>`
- Prerequisite validation: `.specify/scripts/bash/check-prerequisites.sh` checks plan.md, tasks.md, and feature structure.
- Location data rules (enforced by validate-ids.js):
  - `coords` must be an array of two numeric values and appear in JSON with exactly 4 decimal places.
  - `id` must be an 8-character lowercase hex string, be the first key in the location object, and match the SHA‑256-derived value produced by `location-id-gen.js`.
- No dependency manifest present; Node tools assume a system Node.js runtime.

## Quick reference commands
- Serve: `python -m http.server 4000`
- Validate data: `node validate-ids.js path/to/locations.json`
- Generate id: `node location-id-gen.js "27.1392,-82.4526"`
- Create spec: `.specify/scripts/bash/create-new-feature.sh --json "Feature description"`
- Use agent: `/agent speckit.specify <feature description>`

## Agent & template locations
- Agents: `.github/agents/*.agent.md`
- Prompts: `.github/prompts/*.prompt.md`
- Templates & scripts: `.specify/templates/*`, `.specify/scripts/bash/*`

---

Created from README.md, .github/agents, and .specify scripts/templates. Edit this file if you want Copilot to manage additional tooling or MCP servers.
