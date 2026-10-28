# [SUC-001-07] Book catalog management - Atomic bulk book move across collections

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-001-07"
  issue_type: "Sub Use Case"
  summary: "Book catalog management - Atomic bulk book move across collections"
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
    The system SHALL provide a dedicated bulk actions screen enabling an authorized user to select multiple books and move them simultaneously to a target collection, with optional removal from a source collection, in a single atomic transaction.
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
        target_key: "TEST-001-07-01"
        target_summary: "Atomic bulk move of multiple books between two collections"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-07-01-atomic-bulk-move-of-multiple-books-between-two-collections.md"
        scenario:
          when: "The user selects three books in the bulk actions screen, chooses source collection \"Living Room\" and target collection \"Office\", and confirms the move"
          then: "All three books are added to \"Office\" and removed from \"Living Room\" in a single atomic operation"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-07-02"
        target_summary: "Prevent bulk move when book selection is empty"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-07-02-prevent-bulk-move-when-book-selection-is-empty.md"
        scenario:
          when: "The user attempts to trigger a bulk move with zero books selected"
          then: "The bulk move action is disabled or rejected with an explicit validation message"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canEditBooks)"
  statement: >-
    The system SHALL provide a dedicated bulk actions screen enabling an authorized user to select multiple books and move them simultaneously to a target collection, with optional removal from a source collection, in a single atomic transaction.
  traceability:
    local_key: "SUC-001-07"
    parent_use_case: "UC-001"
    source_spec: "openspec/specs/book-catalog/spec.md"
    source_requirement: "Requirement: Déplacer plusieurs livres en lot"
```
