# [TEST-001-03-03] Delete a book belonging to multiple collections

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-001-03-03"
  issue_type: "Test"
  summary: "Delete a book belonging to multiple collections"
  status: "Validated"
  priority: "Highest"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "xray"
    - "book-catalog"
  reporter: null
  assignee: null
  resolution: "Non résolu"
  votes: 0
  time_tracking:
    original_estimate: null
    remaining_estimate: null
    time_spent: null
  attachments: []
  custom_fields:
    test_level: "Acceptance test"
    sanity_check: "Yes"
    regression_test: "Yes"
  issue_links:
    tests:
      - link_type: "Test"
        relationship: "tests"
        target_key: "SUC-001-03"
        target_issue_type: "Sub Use Case"
        target_summary: "Book catalog management - Modal book editing, moving, and deletion with automatic focus"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-001-03-modal-book-edit-move-and-delete.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-001"
        target_issue_type: "Use Case"
        target_summary: "Book catalog management"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-001-book-catalog-management.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: Book catalog management

      Scenario: Delete a book belonging to multiple collections
        Given The user is authenticated in the application
        When The user confirms the deletion of a book present in two collections
        Then The book is permanently removed from both collections

traceability:
  local_key: "TEST-001-03-03"
  use_case_key: "UC-001"
  sub_use_case_key: "SUC-001-03"
  source_spec: "openspec/specs/book-catalog/spec.md"
  source_requirement: "Requirement: Modifier, déplacer et supprimer un livre"
  automated_tests:
    - "server/test/books.test.ts"
    - "server/test/db.test.ts"
    - "web/src/App.test.tsx"
```
