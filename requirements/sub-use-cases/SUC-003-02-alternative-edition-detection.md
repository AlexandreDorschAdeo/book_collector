# [SUC-003-02] Duplicate and alternative edition detection - Alternative edition detection by matching author and title with different ISBN

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-003-02"
  issue_type: "Sub Use Case"
  summary: "Duplicate and alternative edition detection - Alternative edition detection by matching author and title with different ISBN"
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
    When a scanned or entered book shares the same normalized title and author as an owned book but has a different ISBN, the system SHALL report the owned book as an alternative edition.
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
        target_key: "TEST-003-02-01"
        target_summary: "Detect paperback scan when hardcover edition by same author is owned"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-02-01-detect-paperback-scan-when-hardcover-edition-by-same-author-is-ow.md"
        scenario:
          when: "The user scans the paperback edition of a work whose hardcover edition by the same author is already owned"
          then: "The system displays \"You own this title in another edition\" along with the owned ISBN, subtitle, collections, and locations"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-02-02"
        target_summary: "Do not flag books with identical title but different authors as alternative editions"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-02-02-do-not-flag-books-with-identical-title-but-different-authors-as-a.md"
        scenario:
          when: "An owned book has the same title as the scanned book but a different author"
          then: "The system does not flag the owned book as an alternative edition"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    When a scanned or entered book shares the same normalized title and author as an owned book but has a different ISBN, the system SHALL report the owned book as an alternative edition.
  traceability:
    local_key: "SUC-003-02"
    parent_use_case: "UC-003"
    source_spec: "openspec/specs/duplicate-detection/spec.md"
    source_requirement: "Requirement: Détection d'une autre édition"
```
