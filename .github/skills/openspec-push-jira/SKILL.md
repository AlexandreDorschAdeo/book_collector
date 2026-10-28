---
name: openspec-push-jira
description: Push extracted requirements (/requirements/use-cases/*.md and /requirements/sub-use-cases/*.md) and Xray tests (/tests/*.md) to Jira via the Jira MCP server, create issue links (Relates and Test), write back the Jira issue_key inside the files, and rename each file to <ISSUE_KEY>-<slug>.md. Use when the user asks to push requirements or tests to Jira or runs "/opsx-push-jira".
license: MIT
metadata:
  author: book-collector
  version: "1.0"
---

Synchronize local requirement and test artifacts (`/requirements/use-cases/*.md`, `/requirements/sub-use-cases/*.md`, and `/tests/*.md`) to **Jira / Xray** using the configured Jira MCP server, create all hierarchical (`Relates`) and test coverage (`Test`) links in Jira, and rename local files to `<ISSUE_KEY>-<slug>.md`.

---

## 1. Prerequisites & Pre-flight Check

1. Discover available Jira MCP tools (use `tool_search_tool` with query `"jira"` to load deferred Jira MCP tools if needed).
2. If the Jira MCP server is not installed, not connected, or requires authentication:
   - Follow `<copilot_mcp_authentication>` guidelines to inform the user how to connect or sign in.
   - Do not fabricate Jira keys; stop and wait until the Jira MCP connection is ready (unless the user explicitly asks for a dry-run preview).
3. Confirm the target Jira **Project Key** (e.g., `BOOK`, `ISO`, `ISOPIC`) from the user's prompt or from `jira.project.key` in the YAML files.

---

## 2. Topological Push Order

Push artifacts in strict dependency order so parent keys exist before child links are created:

### Step 1 — Push Level 1: `Use Cases` (`/requirements/use-cases/*.md`)
For each `.md` file in `/requirements/use-cases/`:
- Parse the YAML payload.
- **If `jira.key` is a local placeholder (`UC-<NNN>`)**:
  - Create the Jira issue with `issue_type: "Use Case"`, `summary`, `description`, `priority`, `labels`, and `custom_fields.type_of_requirement`.
  - Record the returned Jira `issue_key` (e.g., `ISO-9226`).
- **If `jira.key` is already a real Jira key (`<PROJECT>-<NUM>`)**:
  - Update the existing Jira issue's `summary`, `description`, `priority`, `labels`, and custom fields.

### Step 2 — Push Level 2: `Sub Use Cases` (`/requirements/sub-use-cases/*.md`)
For each `.md` file in `/requirements/sub-use-cases/`:
- Parse the YAML payload.
- **Create** (if `jira.key` starts with `SUC-`) or **Update** (if `jira.key` is already `<PROJECT>-<NUM>`) the Jira issue with `issue_type: "Sub Use Case"`, `summary`, `description`, `priority`, `labels`, and `custom_fields.type_of_requirement`.
- Record the returned Jira `issue_key` (e.g., `ISO-9289`).
- Ensure the **`Relates`** issue link exists in Jira between the parent `Use Case` (`>>> relates to`) and the `Sub Use Case` (`relates to >>>`).

### Step 3 — Push Level 3: `Tests` (`/tests/*.md`)
For each `.md` file in `/tests/`:
- Parse the YAML payload.
- **Create** (if `jira.key` starts with `TEST-`) or **Update** (if `jira.key` is already `<PROJECT>-<NUM>`) the Jira `Test` issue with:
  - `issue_type: "Test"`
  - `summary`, `priority`, `labels`
  - `custom_fields`: `Test level` (`Acceptance test`), `Sanity check` (`Yes`/`No`), `Regression test` (`Yes`/`No`)
  - Xray Gherkin (`xray.gherkin`) specification (`Feature` / `Scenario` / `Given` / `When` / `Then`)
- Record the returned Jira `issue_key` (e.g., `ISO-9285`).
- Ensure the **`Test`** issue links (`tests` / `is tested by`) exist in Jira between:
  1. `Test` ↔ `Sub Use Case`
  2. `Test` ↔ `Use Case`

---

## 3. File Renaming & Cross-Reference Propagation (`<ISSUE_KEY>-<slug>.md`)

Whenever an artifact's key transitions from a local ID (`UC-001`, `SUC-001-01`, `TEST-001-01-01`) to a Jira `issue_key` (e.g., `ISO-9226`, `ISO-9289`, `ISO-9285`):

1. **Preserve local ID**: Store the original local ID in `traceability.local_key` (e.g., `local_key: "UC-001"`) so future `/opsx-extract-req` and `/opsx-extract-tests` runs remain idempotent.
2. **Update YAML & Header inside the file**:
   - Update `# [<ISSUE_KEY>] <Summary>`
   - Update `jira.key: "<ISSUE_KEY>"` and `jira.status` (from Jira response).
3. **Rename the `.md` file on disk**:
   - Strip the local ID prefix (`UC-<NNN>-`, `SUC-<NNN>-<MM>-`, `TEST-<NNN>-<MM>-<KK>-`) and replace it with `<ISSUE_KEY>-`:
     - `requirements/use-cases/UC-001-book-catalog-management.md` → `requirements/use-cases/ISO-9226-book-catalog-management.md`
     - `requirements/sub-use-cases/SUC-001-01-register-book-with-metadata-and-series.md` → `requirements/sub-use-cases/ISO-9289-register-book-with-metadata-and-series.md`
     - `tests/TEST-001-01-01-valid-book-registration-with-writer-and-illustrator-roles.md` → `tests/ISO-9285-valid-book-registration-with-writer-and-illustrator-roles.md`
4. **Propagate new keys & filenames everywhere**:
   - Update `target_key`, `target_file`, `parent_use_case`, `use_case_key`, and `sub_use_case_key` across all files in `/requirements/use-cases/`, `/requirements/sub-use-cases/`, and `/tests/`.
   - Regenerate `/requirements/README.md` and `/tests/README.md` with the new `<ISSUE_KEY>` identifiers and file paths.
