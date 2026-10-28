# [SUC-001-06] Book catalog management - Catalog data persistence across application restarts

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-001-06"
  issue_type: "Sub Use Case"
  summary: "Book catalog management - Catalog data persistence across application restarts"
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
    - "book-catalog"
  reporter: null
  assignee: null
  resolution: "Non résolu"
  votes: 0
  time_tracking:
    original_estimate: null
    remaining_estimate: null
    time_spent: null
  custom_fields:
    type_of_requirement: "Non-Functional"
  description: >-
    The system SHALL persist all collections and books on disk so that all catalog data remains intact after an application or container restart.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-001"
        target_issue_type: "Use Case"
        target_summary: "Book catalog management"
        target_status: "Prêt"
        target_file: "../use-cases/UC-001-book-catalog-management.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-06-01"
        target_summary: "Retain collections and books after application restart"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-06-01-retain-collections-and-books-after-application-restart.md"
        scenario:
          when: "The application is restarted"
          then: "All previously registered collections and books remain available"

ireb:
  category: "Non-Functional - Quality (Persistence)"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    The system SHALL persist all collections and books on disk so that all catalog data remains intact after an application or container restart.
  traceability:
    local_key: "SUC-001-06"
    parent_use_case: "UC-001"
    source_spec: "openspec/specs/book-catalog/spec.md"
    source_requirement: "Requirement: Persistance des données"
```
