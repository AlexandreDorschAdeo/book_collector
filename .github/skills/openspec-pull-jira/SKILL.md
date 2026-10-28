---
name: openspec-pull-jira
description: Pull Use Cases, Sub Use Cases, and Xray Tests from Jira into /requirements/ and /tests/ (both for brownfield initialization and ongoing product lifecycle synchronization) without modifying openspec/specs/ by default, with an opt-in debrayable mode (--propose-openspec) to generate an OpenSpec change proposal. Use when the user asks to pull/sync from Jira or runs "/opsx-pull-jira".
license: MIT
metadata:
  author: book-collector
  version: "1.0"
---

Pull `Use Case`, `Sub Use Case`, and `Test` (Xray) artifacts from Jira via the Jira MCP server into `/requirements/` and `/tests/`, supporting both **brownfield project import** and **ongoing product lifecycle synchronization**.

---

## 1. Core Safety Rule: Protect `openspec/specs/` by Default

- **Default Behavior (Safe Mode)**:
  - `/opsx-pull-jira` ONLY creates or updates files inside `/requirements/` (`use-cases/`, `sub-use-cases/`, `README.md`) and `/tests/` (`*.md`, `README.md`).
  - It **MUST NEVER** directly edit or overwrite `openspec/specs/**/spec.md` so OpenSpec specifications cannot be polluted or broken by external Jira edits.
- **Debrayable OpenSpec Sync (`--propose-openspec` or explicit user opt-in)**:
  - Only when the user explicitly enables OpenSpec synchronization (e.g., `/opsx-pull-jira --propose-openspec` or confirms via prompt), generate a reviewable OpenSpec change under `openspec/changes/jira-sync-<YYYY-MM-DD>/` (`proposal.md` + delta `specs/<capability>/spec.md`) for any new or modified requirements/scenarios discovered in Jira.

---

## 2. Supported Scenarios

### Scenario A — Ongoing Product Lifecycle Sync (Existing Repo)
When `/requirements/` and `/tests/` already exist:
1. Query Jira via MCP for all `Use Case`, `Sub Use Case`, and `Test` issues matching the project key, JQL filter, or tracked keys in `/requirements/` and `/tests/`.
2. Match each Jira issue by `jira.key` (`<ISSUE_KEY>-<slug>.md`):
   - **Existing issue**: Update `status` (`Prêt`, `Nouveau`, `To review`, `Validated`, `Fermée`), `summary`, `description`, `priority`, `assignee`, `reporter`, `labels`, `custom_fields`, `issue_links` (`Relates` and `Test`), and `xray.gherkin` inside its `<ISSUE_KEY>-<slug>.md` file. If the summary slug changed significantly and the user requested filename refresh, update `<ISSUE_KEY>-<new-slug>.md` and references.
   - **New issue created directly in Jira (by PO/QA)**:
     - Create `/requirements/use-cases/<ISSUE_KEY>-<slug>.md` (for `Use Case`), `/requirements/sub-use-cases/<ISSUE_KEY>-<slug>.md` (for `Sub Use Case`), or `/tests/<ISSUE_KEY>-<slug>.md` (for `Test`).
     - Format the requirement statement following the **IREB (CPRE)** standard and link it to its parent/child/test issues via `issue_links`.

### Scenario B — Brownfield Initialization (Existing Jira Project → Empty/New Repo)
When importing an existing Jira/Xray repository into a project:
1. Query Jira via MCP using the target project key or JQL filter for:
   - `issuetype = "Use Case"`
   - `issuetype = "Sub Use Case"`
   - `issuetype = "Test"`
2. Reconstruct the 3-tier hierarchy from Jira `issue_links`:
   - `Use Case` ↔ `Sub Use Case` via `Relates` (`>>> relates to` / `relates to >>>`)
   - `Test` ↔ `Sub Use Case` & `Use Case` via `Test` (`tests` / `is tested by`)
3. Generate:
   - `/requirements/use-cases/<ISSUE_KEY>-<slug>.md` for every `Use Case`
   - `/requirements/sub-use-cases/<ISSUE_KEY>-<slug>.md` for every `Sub Use Case`
   - `/tests/<ISSUE_KEY>-<slug>.md` for every `Test`
   - `/requirements/README.md` and `/tests/README.md` traceability matrices
4. If `--propose-openspec` is requested, also scaffold an OpenSpec change proposal under `openspec/changes/` so the team can review and adopt the imported specs into OpenSpec cleanly.

---

## 3. Execution Steps

1. Discover and verify Jira MCP server connectivity (use `tool_search_tool` with `"jira"` if needed).
2. Determine query scope (Project Key, JQL, or specific issue keys) and whether `--propose-openspec` is enabled (off by default).
3. Fetch `Use Case`, `Sub Use Case`, and `Test` issues and their links/custom fields.
4. Write or update `/requirements/use-cases/<ISSUE_KEY>-<slug>.md`, `/requirements/sub-use-cases/<ISSUE_KEY>-<slug>.md`, and `/tests/<ISSUE_KEY>-<slug>.md`.
5. Refresh `/requirements/README.md` and `/tests/README.md`.
6. Summarize all pulled changes (new artifacts, status transitions, modified descriptions/Gherkin, and any uncovered requirements).
