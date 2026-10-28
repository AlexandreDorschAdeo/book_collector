# [SUC-006-02] Physical collection and location management - Case-insensitive uniqueness of collection name and location pair

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-006-02"
  issue_type: "Sub Use Case"
  summary: "Physical collection and location management - Case-insensitive uniqueness of collection name and location pair"
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
    The system SHALL reject the creation or update of two collections sharing the same name and location (case-insensitively).
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
        target_key: "TEST-006-02-01"
        target_summary: "Reject duplicate collection name and location regardless of letter case"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-02-01-reject-duplicate-collection-name-and-location-regardless-of-lette.md"
        scenario:
          when: "The user attempts to create collection \"bd\" at location \"Living Room\" while \"BD\" at \"Living Room\" already exists"
          then: "The system rejects the creation with an explicit duplicate error message"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    The system SHALL reject the creation or update of two collections sharing the same name and location (case-insensitively).
  traceability:
    local_key: "SUC-006-02"
    parent_use_case: "UC-006"
    source_spec: "openspec/specs/collection-management/spec.md"
    source_requirement: "Requirement: Unicité du nom de collection"
```
