# [SUC-001-04] Book catalog management - Collection book listing, sorting, and type filtering

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-001-04"
  issue_type: "Sub Use Case"
  summary: "Book catalog management - Collection book listing, sorting, and type filtering"
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
    type_of_requirement: "Functional"
  description: >-
    The system SHALL provide the user with the ability to list books within a collection, sort them by title, author, series, or date added, and filter them by book type.
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
        target_key: "TEST-001-04-01"
        target_summary: "Filter collection books by type"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-04-01-filter-collection-books-by-type.md"
        scenario:
          when: "The user opens a collection and filters by book type \"BD\""
          then: "Only books of type \"BD\" belonging to that collection are displayed"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Collector / Authenticated User"
  statement: >-
    The system SHALL provide the user with the ability to list books within a collection, sort them by title, author, series, or date added, and filter them by book type.
  traceability:
    local_key: "SUC-001-04"
    parent_use_case: "UC-001"
    source_spec: "openspec/specs/book-catalog/spec.md"
    source_requirement: "Requirement: Lister les livres d'une collection"
```
