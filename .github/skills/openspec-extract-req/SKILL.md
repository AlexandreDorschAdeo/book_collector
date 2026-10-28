---
name: openspec-extract-req
description: Extract business requirements from OpenSpec specifications using the IREB (CPRE) standard into one .md YAML file per Jira artifact (Use Case and Sub Use Case). Use when the user asks to extract IREB requirements, generate Jira Use Cases / Sub Use Cases from OpenSpec, or runs "/opsx-extract-req".
license: MIT
metadata:
  author: book-collector
  version: "1.0"
---

Extract business requirements from the repository's OpenSpec specifications (`openspec/specs/` and active changes in `openspec/changes/`) and generate **one `.md` file per Jira artifact** (`Use Case` and `Sub Use Case`) containing a structured YAML payload compliant with the **IREB (CPRE)** standard and ready for **Jira import** (matching the Adeo Jira `Use Case` / `Sub Use Case` / `Test` schema).

---

## 1. Scope & Sources Discovery

1. Scan `openspec/specs/**/spec.md` for all consolidated capability specifications.
2. Scan active (unarchived) changes in `openspec/changes/<change>/specs/**/spec.md` so newly implemented or proposed delta requirements (`ADDED` / `MODIFIED` / `REMOVED`) are merged with their corresponding capability.
3. Each OpenSpec capability (or cohesive functional domain) maps to **Level 1 (`Use Case`)**.
4. Each `### Requirement:` block inside that capability maps to **Level 2 (`Sub Use Case`)**.
5. Each `#### Scenario:` (`WHEN` / `THEN`) inside a requirement maps to a linked **`Test`** entry (`is tested by`) on both the `Sub Use Case` and the parent `Use Case`.

---

## 2. IREB (CPRE) Formulation Rules

Every extracted requirement MUST adhere to the **IREB (International Requirements Engineering Board)** quality criteria and sentence templates:

- **Default Language**: **English** (matching Jira `Use Case` / `Sub Use Case` conventions such as `ISO-*` and `ISOPIC-*`), unless the user explicitly requests another language.
- **Requirement Classification (`type_of_requirement`)**:
  - `Functional` (User interaction, autonomous system activity, interface requirement)
  - `Non-Functional` (Quality requirement: performance, security, usability, persistence; or Constraint)
- **Legal Obligation Level (`obligation`)**:
  - `SHALL` (mandatory requirement)
  - `SHOULD` (recommended requirement)
  - `MAY` (optional requirement)
- **IREB Canonical Boilerplates (Sentence Templates)**:
  - *User Interaction*: `[When <condition>,] the system SHALL provide <actor> with the ability to <process> <object> [<qualifying details>].`
  - *Autonomous System Activity*: `[When <condition>,] the system SHALL <process> <object> [<qualifying details>].`
  - *Quality / Constraint*: `The system SHALL <meet quality/constraint> [<qualifying details>].`
- **IREB Quality Checklist**:
  - **Unambiguous & Consistent**: One clear obligation per `Sub Use Case`.
  - **Verifiable**: Every `Sub Use Case` is backed by at least one `is tested by` test scenario with explicit `when` and `then` assertions.
  - **Traceable**: Every artifact records `source_spec` (file path in `openspec/`) and `source_requirement` (original OpenSpec heading).

---

## 3. Two-Level Jira Hierarchy & File Organization

Generate **one `.md` file per Jira ticket** inside `requirements/`:

- **Before Jira push** (local key):
  - `requirements/use-cases/UC-<NNN>-<slug>.md` — **1 file per `Use Case`**
  - `requirements/sub-use-cases/SUC-<NNN>-<MM>-<slug>.md` — **1 file per `Sub Use Case`**
- **After Jira push / pull** (`<ISSUE_KEY>-<slug>.md`):
  - `requirements/use-cases/<ISSUE_KEY>-<slug>.md` (e.g., `ISO-9226-book-catalog-management.md`)
  - `requirements/sub-use-cases/<ISSUE_KEY>-<slug>.md` (e.g., `ISO-9289-register-book-with-metadata-and-series.md`)
  - If a file already has a Jira `<ISSUE_KEY>` (and `traceability.local_key`), preserve its Jira `<ISSUE_KEY>` and filename when re-running `/opsx-extract-req`.
- `requirements/README.md` — **Master traceability matrix** linking every `Use Case`, `Sub Use Case`, `/tests/*.md` file, and `OpenSpec` source.

### Naming & Link Conventions (Jira `Use Case` ↔ `Sub Use Case` ↔ `Test`)

1. **`Use Case` Summary**: `<Business Journey / Capability Name>` (e.g., `Book series and missing volumes management`)
2. **`Sub Use Case` Summary**: `<Use Case Summary> - <Sub Use Case Scope>` (e.g., `Book series and missing volumes management - Automatic missing volumes calculation`)
3. **Link between `Use Case` and `Sub Use Case` (`Relates`)**:
   - On the **`Use Case`**: `issue_links.relates` lists each child `Sub Use Case` with `direction: ">>> relates to"` and `target_file`.
   - On the **`Sub Use Case`**: `issue_links.relates` references the parent `Use Case` with `direction: "relates to >>>"` and `target_file`.
4. **Link to Test Cases (`Test` in `/tests/*.md`)**:
   - On the **`Sub Use Case`**: `issue_links.tests` lists its own test scenarios with `relationship: "is tested by"` and `target_file: "../../tests/<TEST_FILE>.md"`.
   - On the **`Use Case`**: `issue_links.tests` consolidates all `is tested by` test scenarios across all its `Sub Use Cases` with `target_file: "../../tests/<TEST_FILE>.md"`.

---

## 4. Canonical `.md` File Templates (YAML)

### 4.1 Level 1 — `Use Case` (`requirements/use-cases/UC-<NNN>-<slug>.md`)

```markdown
# [UC-<NNN>] <Use Case Summary>

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 1

jira:
  key: "UC-<NNN>"
  issue_type: "Use Case"
  summary: "<Use Case Summary>"
  status: "Prêt"
  priority: "Highest"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "ireb"
    - "<capability-slug>"
  reporter: null
  assignee: null
  resolution: "Non résolu"
  votes: 0
  time_tracking:
    original_estimate: null
    remaining_estimate: null
    time_spent: null
  custom_fields:
    type_of_requirement: "Functional"
  description: >-
    <Actor-centric summary sentence describing the business journey, e.g.,
    "A collector organizes books by story series and identifies missing volumes
    for second-hand bookshop searches or gift lists.">
  issue_links:
    relates:
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-<NNN>-01"
        target_issue_type: "Sub Use Case"
        target_summary: "<Use Case Summary> - <Sub Use Case 1>"
        target_status: "Nouveau"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-<NNN>-01-01"
        target_summary: "<Scenario title in English>"
        target_status: "Validated"

ireb:
  actor: "<Primary Actor>"
  obligation: "SHALL"
  business_goal: >-
    <Business objective from the OpenSpec Purpose section>
  preconditions:
    - "<Precondition 1>"
  postconditions:
    - "<Postcondition 1>"
  traceability:
    source_specs:
      - "<path/to/openspec/spec.md>"
```
```

### 4.2 Level 2 — `Sub Use Case` (`requirements/sub-use-cases/SUC-<NNN>-<MM>-<slug>.md`)

```markdown
# [SUC-<NNN>-<MM>] <Use Case Summary> - <Sub Use Case Scope>

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-<NNN>-<MM>"
  issue_type: "Sub Use Case"
  summary: "<Use Case Summary> - <Sub Use Case Scope>"
  status: "Nouveau"
  priority: "Highest"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "ireb"
    - "<capability-slug>"
  reporter: null
  assignee: null
  resolution: "Non résolu"
  votes: 0
  time_tracking:
    original_estimate: null
    remaining_estimate: null
    time_spent: null
  custom_fields:
    type_of_requirement: "Functional"
  description: >-
    <IREB requirement statement in English using the SHALL boilerplate>
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-<NNN>"
        target_issue_type: "Use Case"
        target_summary: "<Use Case Summary>"
        target_status: "Prêt"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-<NNN>-<MM>-01"
        target_summary: "<Scenario title in English>"
        target_status: "Validated"
        scenario:
          when: "<Trigger / Precondition in English>"
          then: "<Expected verifiable system outcome in English>"

ireb:
  category: "Functional - User Interaction | Functional - System Activity | Non-Functional - Quality"
  obligation: "SHALL"
  actor: "<Primary Actor>"
  statement: >-
    <Canonical IREB requirement sentence in English>
  traceability:
    parent_use_case: "UC-<NNN>"
    source_spec: "<path/to/openspec/spec.md>"
    source_requirement: "<Original OpenSpec ### Requirement heading>"
```
```

---

## 5. Execution Steps

1. Read all specs in `openspec/specs/` and active delta specs in `openspec/changes/` (excluding `openspec/changes/archive/`).
2. Consolidate the effective requirements per capability.
3. Generate or update every `requirements/use-cases/UC-<NNN>-<slug>.md` file.
4. Generate or update every `requirements/sub-use-cases/SUC-<NNN>-<MM>-<slug>.md` file.
5. Generate or update `requirements/README.md` with a summary table of all Use Cases, Sub Use Cases, and test counts.
6. Report the number of Use Cases, Sub Use Cases, and Test scenarios generated.
