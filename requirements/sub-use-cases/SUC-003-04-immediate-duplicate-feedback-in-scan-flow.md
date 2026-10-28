# [SUC-003-04] Duplicate and alternative edition detection - Immediate duplicate check feedback during scan and manual entry

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-003-04"
  issue_type: "Sub Use Case"
  summary: "Duplicate and alternative edition detection - Immediate duplicate check feedback during scan and manual entry"
  status: "Nouveau"
  priority: "High"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "ireb"
    - "duplicate-detection"
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
    The system SHALL display the duplicate check result simultaneously with the looked-up book metadata prior to creation confirmation, and SHALL explicitly indicate when no duplicate exists.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-003"
        target_issue_type: "Use Case"
        target_summary: "Duplicate and alternative edition detection"
        target_status: "Prêt"
        target_file: "../use-cases/UC-003-duplicate-and-edition-detection.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-04-01"
        target_summary: "Display explicit non-duplicate confirmation when book is not owned"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-04-01-display-explicit-non-duplicate-confirmation-when-book-is-not-owne.md"
        scenario:
          when: "The user scans a book absent from all collections and having no alternative edition"
          then: "The system indicates that the book is not yet owned and offers to add it"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-04-02"
        target_summary: "Run alternative edition check on manual title and author entry without ISBN"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-04-02-run-alternative-edition-check-on-manual-title-and-author-entry-wi.md"
        scenario:
          when: "The user manually enters the title and author of a book without an ISBN"
          then: "The system executes alternative edition detection on the entered values"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Collector / Authenticated User"
  statement: >-
    The system SHALL display the duplicate check result simultaneously with the looked-up book metadata prior to creation confirmation, and SHALL explicitly indicate when no duplicate exists.
  traceability:
    local_key: "SUC-003-04"
    parent_use_case: "UC-003"
    source_spec: "openspec/specs/duplicate-detection/spec.md"
    source_requirement: "Requirement: Indication immédiate dans le flux de scan"
```
