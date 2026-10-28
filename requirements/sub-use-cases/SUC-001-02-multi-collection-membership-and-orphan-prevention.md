# [SUC-001-02] Book catalog management - Multi-collection membership and orphan book prevention

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-001-02"
  issue_type: "Sub Use Case"
  summary: "Book catalog management - Multi-collection membership and orphan book prevention"
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
    The system SHALL allow a book to belong to multiple collections simultaneously and SHALL enforce that every registered book belongs to at least one collection at all times.
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
        target_key: "TEST-001-02-01"
        target_summary: "Attach an existing book to a second collection"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-02-01-attach-an-existing-book-to-a-second-collection.md"
        scenario:
          when: "The user attaches a book already present in \"Living Room\" to \"Country House\""
          then: "The book appears in both collections as a single shared book record"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-02-02"
        target_summary: "Prevent removal of a book from its last remaining collection"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-02-02-prevent-removal-of-a-book-from-its-last-remaining-collection.md"
        scenario:
          when: "The user attempts to remove a book from the only collection it belongs to"
          then: "The system rejects the removal and prompts the user to either move the book to another collection or delete it"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "Authenticated User (canEditBooks)"
  statement: >-
    The system SHALL allow a book to belong to multiple collections simultaneously and SHALL enforce that every registered book belongs to at least one collection at all times.
  traceability:
    local_key: "SUC-001-02"
    parent_use_case: "UC-001"
    source_spec: "openspec/specs/book-catalog/spec.md"
    source_requirement: "Requirement: Appartenance à plusieurs collections"
```
