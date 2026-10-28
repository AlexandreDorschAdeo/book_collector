# [SUC-006-04] Physical collection and location management - Collections list overview with location and book count

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-006-04"
  issue_type: "Sub Use Case"
  summary: "Physical collection and location management - Collections list overview with location and book count"
  status: "Nouveau"
  priority: "Medium"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "ireb"
    - "collection-management"
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
    The system SHALL display the list of collections showing each collection's physical location and its up-to-date number of books.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-006"
        target_issue_type: "Use Case"
        target_summary: "Physical collection and location management"
        target_status: "Prêt"
        target_file: "../use-cases/UC-006-physical-collection-and-location-management.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-04-01"
        target_summary: "Display accurate book counters per collection"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-04-01-display-accurate-book-counters-per-collection.md"
        scenario:
          when: "The user opens the collections screen"
          then: "Each collection displays its current number of assigned books"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Collector / Authenticated User"
  statement: >-
    The system SHALL display the list of collections showing each collection's physical location and its up-to-date number of books.
  traceability:
    local_key: "SUC-006-04"
    parent_use_case: "UC-006"
    source_spec: "openspec/specs/collection-management/spec.md"
    source_requirement: "Requirement: Aperçu des collections"
```
