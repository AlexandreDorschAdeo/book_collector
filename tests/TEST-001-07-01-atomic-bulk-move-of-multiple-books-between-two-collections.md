# [TEST-001-07-01] Atomic bulk move of multiple books between two collections

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-001-07-01"
  issue_type: "Test"
  summary: "Atomic bulk move of multiple books between two collections"
  status: "Validated"
  priority: "High"
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
        target_key: "SUC-001-07"
        target_issue_type: "Sub Use Case"
        target_summary: "Book catalog management - Atomic bulk book move across collections"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-001-07-bulk-move-books-across-collections.md"
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

      Scenario: Atomic bulk move of multiple books between two collections
        Given The user is authenticated in the application
        When The user selects three books in the bulk actions screen, chooses source collection "Living Room" and target collection "Office", and confirms the move
        Then All three books are added to "Office" and removed from "Living Room" in a single atomic operation

traceability:
  local_key: "TEST-001-07-01"
  use_case_key: "UC-001"
  sub_use_case_key: "SUC-001-07"
  source_spec: "openspec/specs/book-catalog/spec.md"
  source_requirement: "Requirement: Déplacer plusieurs livres en lot"
  automated_tests:
    - "server/test/books.test.ts"
    - "server/test/db.test.ts"
    - "web/src/App.test.tsx"
```
