# [SUC-001-03] Book catalog management - Modal book editing, moving, and deletion with automatic focus

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-001-03"
  issue_type: "Sub Use Case"
  summary: "Book catalog management - Modal book editing, moving, and deletion with automatic focus"
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
    When the user triggers an edit or move action on a book card, the system SHALL display the corresponding form inside a centered modal dialog with automatic keyboard focus while preserving the catalog scroll position, and SHALL allow book deletion after confirmation.
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
        target_key: "TEST-001-03-01"
        target_summary: "Open centered edit or move modal with automatic focus"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-03-01-open-centered-edit-or-move-modal-with-automatic-focus.md"
        scenario:
          when: "The user clicks \"Edit\" or \"Move\" on a book card located at the bottom of the catalog list"
          then: "The corresponding form opens immediately in a centered modal dialog with keyboard focus inside the modal without losing the page scroll position"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-03-02"
        target_summary: "Move a book from one collection to another"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-03-02-move-a-book-from-one-collection-to-another.md"
        scenario:
          when: "The user moves a book from \"Living Room\" to \"Country House\""
          then: "The book appears in \"Country House\" and is removed from \"Living Room\" while preserving any other collection memberships"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-03-03"
        target_summary: "Delete a book belonging to multiple collections"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-03-03-delete-a-book-belonging-to-multiple-collections.md"
        scenario:
          when: "The user confirms the deletion of a book present in two collections"
          then: "The book is permanently removed from both collections"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canEditBooks / canDeleteBooks)"
  statement: >-
    When the user triggers an edit or move action on a book card, the system SHALL display the corresponding form inside a centered modal dialog with automatic keyboard focus while preserving the catalog scroll position, and SHALL allow book deletion after confirmation.
  traceability:
    local_key: "SUC-001-03"
    parent_use_case: "UC-001"
    source_spec: "openspec/specs/book-catalog/spec.md"
    source_requirement: "Requirement: Modifier, déplacer et supprimer un livre"
```
