# [SUC-001-08] Book catalog management - Atomic bulk metadata and series update with automatic volume extraction

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-001-08"
  issue_type: "Sub Use Case"
  summary: "Book catalog management - Atomic bulk metadata and series update with automatic volume extraction"
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
    The system SHALL provide an authorized user with the ability to apply shared values for selected fields (type, publisher, series, subtitle, authors, collections) across multiple selected books simultaneously without altering unchecked fields, including optional automatic extraction of each book's volume number from its existing title or subtitle.
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
        target_key: "TEST-001-08-01"
        target_summary: "Bulk update of book type and publisher without altering other fields"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-08-01-bulk-update-of-book-type-and-publisher-without-altering-other-fie.md"
        scenario:
          when: "The user selects four books, checks only \"Type\" (\"Manga\") and \"Publisher\" (\"Glénat\"), and confirms the bulk update"
          then: "All four books are updated to type \"Manga\" and publisher \"Glénat\" while their respective titles, ISBNs, authors, and collections remain unchanged"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-08-02"
        target_summary: "Bulk update of authors or collections in a single transaction"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-08-02-bulk-update-of-authors-or-collections-in-a-single-transaction.md"
        scenario:
          when: "The user selects multiple books and applies a shared author list or collection list via the bulk edit modal"
          then: "All selected books receive the specified authors or collections in a single atomic transaction"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-08-03"
        target_summary: "Bulk series assignment with automatic volume number detection"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-08-03-bulk-series-assignment-with-automatic-volume-number-detection.md"
        scenario:
          when: "The user selects books titled \"One Piece - Tome 1\" and \"One Piece - Tome 4\", enables the \"Series\" field with value \"One Piece\", and checks automatic volume number extraction"
          then: "The selected books are assigned to series \"One Piece\" with volume numbers 1 and 4 respectively"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canEditBooks)"
  statement: >-
    The system SHALL provide an authorized user with the ability to apply shared values for selected fields (type, publisher, series, subtitle, authors, collections) across multiple selected books simultaneously without altering unchecked fields, including optional automatic extraction of each book's volume number from its existing title or subtitle.
  traceability:
    local_key: "SUC-001-08"
    parent_use_case: "UC-001"
    source_spec: "openspec/changes/book-series-and-missing-volumes/specs/book-catalog/spec.md"
    source_requirement: "Requirement: Modifier plusieurs livres en lot"
```
