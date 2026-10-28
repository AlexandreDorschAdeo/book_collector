# [SUC-001-05] Book catalog management - Global case- and accent-insensitive search across all collections

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-001-05"
  issue_type: "Sub Use Case"
  summary: "Book catalog management - Global case- and accent-insensitive search across all collections"
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
    type_of_requirement: "Functional"
  description: >-
    The system SHALL provide a case-insensitive and accent-insensitive full-text search across title, subtitle, series name, authors, publisher, and ISBN spanning all collections.
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
        target_key: "TEST-001-05-01"
        target_summary: "Cross-collection search by author, series, or publisher without duplicate rows"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-05-01-cross-collection-search-by-author-series-or-publisher-without-dup.md"
        scenario:
          when: "The user searches for \"uderzo\", a series name, or a publisher name when matching books exist across two collections"
          then: "The search results return matching books from both collections with their collection names and locations without duplicating a book assigned to multiple collections"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-05-02"
        target_summary: "Empty search result notification"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-05-02-empty-search-result-notification.md"
        scenario:
          when: "The search query matches no book in the catalog"
          then: "The system displays an explicit empty-state message indicating that no matching book was found"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Collector / Authenticated User"
  statement: >-
    The system SHALL provide a case-insensitive and accent-insensitive full-text search across title, subtitle, series name, authors, publisher, and ISBN spanning all collections.
  traceability:
    local_key: "SUC-001-05"
    parent_use_case: "UC-001"
    source_spec: "openspec/changes/book-series-and-missing-volumes/specs/book-catalog/spec.md"
    source_requirement: "Requirement: Rechercher dans toutes les collections"
```
