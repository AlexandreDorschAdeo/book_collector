---
name: openspec-extract-tests
description: Extract acceptance test cases from OpenSpec specifications in Gherkin format into one .md YAML file per Jira/Xray Test artifact under /tests/, with bidirectional traceability links to /requirements/ Use Cases and Sub Use Cases. Use when the user asks to extract tests for Jira/Xray or runs "/opsx-extract-tests".
license: MIT
metadata:
  author: book-collector
  version: "1.0"
---

Extract verifiable acceptance test scenarios from the repository's OpenSpec specifications (`openspec/specs/` and active changes in `openspec/changes/`) and generate **one `.md` file per Jira/Xray `Test` ticket** in `/tests/`, formatted with a structured YAML payload (including **Gherkin** specification) and bidirectional links to `/requirements/use-cases/` and `/requirements/sub-use-cases/`.

---

## 1. Scope & Sources Discovery

1. Read existing `/requirements/use-cases/*.md` and `/requirements/sub-use-cases/*.md` (if missing, run the `openspec-extract-req` workflow first).
2. Scan `openspec/specs/**/spec.md` and active delta specs in `openspec/changes/<change>/specs/**/spec.md` for all `#### Scenario:` blocks (`WHEN` / `THEN`).
3. Inspect automated test files in `server/tests/**/*.test.ts` and `web/src/**/*.test.tsx` to map each acceptance test to its automated test coverage where applicable.
4. Preserve existing Jira issue keys (`<ISSUE_KEY>-<slug>.md`) if files in `/tests/` or `/requirements/` were already pushed to or pulled from Jira.

---

## 2. File Organization & Naming Convention

Generate **one `.md` file per Jira/Xray `Test` artifact** at the repository root under `/tests/`:

- **Before Jira push** (local key): `tests/TEST-<NNN>-<MM>-<KK>-<slug>.md`
- **After Jira push / pull** (Jira `issue_key`): `tests/<ISSUE_KEY>-<slug>.md` (e.g., `tests/ISO-9285-complete-customer-handover.md`)
- **Master test index**: `tests/README.md` — full traceability matrix linking every `Test` to its `Sub Use Case`, `Use Case`, Gherkin scenario, and automated test file.

---

## 3. Bidirectional Linking Rules (`Test` ↔ `Sub Use Case` & `Use Case`)

Matches the Adeo Jira / Xray linking model (`ISO-9285` ↔ `ISO-9289` / `ISO-9226` and `ISOPIC-862` ↔ `ISOPIC-845`):

1. **In `/tests/<KEY>-<slug>.md` (`issue_links.tests`)**:
   - Contains **two** `tests` links (`link_type: "Test"`, `relationship: "tests"`):
     1. One pointing to the covered **`Sub Use Case`** (`SUC-<NNN>-<MM>` or `<ISSUE_KEY>`, with `target_file: "../requirements/sub-use-cases/<filename>.md"`).
     2. One pointing to the parent **`Use Case`** (`UC-<NNN>` or `<ISSUE_KEY>`, with `target_file: "../requirements/use-cases/<filename>.md"`).
2. **In `/requirements/sub-use-cases/<KEY>-<slug>.md` (`issue_links.tests`)**:
   - Lists each covering test with `link_type: "Test"`, `relationship: "is tested by"`, `target_key`, `target_summary`, `target_status`, and `target_file: "../../tests/<filename>.md"`.
3. **In `/requirements/use-cases/<KEY>-<slug>.md` (`issue_links.tests`)**:
   - Consolidates all covering tests across its child `Sub Use Cases` with `link_type: "Test"`, `relationship: "is tested by"`, `target_key`, `target_summary`, `target_status`, and `target_file: "../../tests/<filename>.md"`.

---

## 4. Canonical `/tests/<KEY>-<slug>.md` Template (Jira / Xray + Gherkin YAML)

```markdown
# [TEST-<NNN>-<MM>-<KK>] <Test Summary in English>

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-<NNN>-<MM>-<KK>"
  issue_type: "Test"
  summary: "<Test Summary in English>"
  status: "To review"
  priority: "Highest"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "xray"
    - "<capability-slug>"
  reporter: null
  assignee: null
  resolution: "Non résolu"
  votes: 0
  time_tracking:
    original_estimate: null
    remaining_estimate: null
    time_spent: null
  attachments: []
  custom_fields:
    test_level: "Acceptance test"
    sanity_check: "Yes"
    regression_test: "Yes"
  issue_links:
    tests:
      - link_type: "Test"
        relationship: "tests"
        target_key: "SUC-<NNN>-<MM>"
        target_issue_type: "Sub Use Case"
        target_summary: "<Use Case Summary> - <Sub Use Case Scope>"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-<NNN>-<MM>-<slug>.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-<NNN>"
        target_issue_type: "Use Case"
        target_summary: "<Use Case Summary>"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-<NNN>-<slug>.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: <Use Case Summary>

      Scenario: <Test Summary in English>
        Given <Precondition / Context in English>
        When <Action / Trigger in English>
        Then <Expected verifiable outcome in English>

traceability:
  local_key: "TEST-<NNN>-<MM>-<KK>"
  use_case_key: "UC-<NNN>"
  sub_use_case_key: "SUC-<NNN>-<MM>"
  source_spec: "<path/to/openspec/spec.md>"
  source_requirement: "<Original OpenSpec ### Requirement heading>"
  source_scenario: "<Original OpenSpec #### Scenario heading>"
  automated_tests:
    - "<server/tests/... or web/src/...>"
```
```

---

## 5. Execution Steps

1. Read all `/requirements/use-cases/*.md` and `/requirements/sub-use-cases/*.md` files.
2. For each test scenario, generate or update `/tests/<KEY>-<slug>.md` with the Jira/Xray metadata, `tests` links (`Sub Use Case` + `Use Case`), Gherkin `Feature`/`Scenario`/`Given`/`When`/`Then`, and `traceability` block.
3. Update `/requirements/sub-use-cases/*.md` and `/requirements/use-cases/*.md` so every entry in `issue_links.tests` includes `target_file: "../../tests/<KEY>-<slug>.md"`.
4. Generate or update `/tests/README.md` and `/requirements/README.md` with clickable links between requirements and tests.
5. Report the total number of generated/updated test files and verified bidirectional links.
