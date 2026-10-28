# [SUC-002-01] Book series and missing volumes management - Case- and accent-insensitive series grouping and volume sorting

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-002-01"
  issue_type: "Sub Use Case"
  summary: "Book series and missing volumes management - Case- and accent-insensitive series grouping and volume sorting"
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
    - "series-management"
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
    The system SHALL automatically group under a single series all books sharing the same normalized series name (ignoring case and accents), ordered by ascending volume number.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-002"
        target_issue_type: "Use Case"
        target_summary: "Book series and missing volumes management"
        target_status: "Prêt"
        target_file: "../use-cases/UC-002-book-series-and-missing-volumes.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-01-01"
        target_summary: "Case- and accent-insensitive series aggregation"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-01-01-case-and-accent-insensitive-series-aggregation.md"
        scenario:
          when: "Two books are registered with series names \"One Piece\" (volume 1) and \"one piece\" (volume 2)"
          then: "The series screen groups both books under a single \"One Piece\" series with volumes 1 and 2 ordered sequentially"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    The system SHALL automatically group under a single series all books sharing the same normalized series name (ignoring case and accents), ordered by ascending volume number.
  traceability:
    local_key: "SUC-002-01"
    parent_use_case: "UC-002"
    source_spec: "openspec/changes/book-series-and-missing-volumes/specs/series-management/spec.md"
    source_requirement: "Requirement: Regroupement des livres par série et numéro de tome"
```
