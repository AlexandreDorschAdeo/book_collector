# [TEST-001-08-01] Bulk update of book type and publisher without altering other fields

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-001-08-01"
  issue_type: "Test"
  summary: "Bulk update of book type and publisher without altering other fields"
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
        target_key: "SUC-001-08"
        target_issue_type: "Sub Use Case"
        target_summary: "Book catalog management - Atomic bulk metadata and series update with automatic volume extraction"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-001-08-bulk-update-books-with-volume-extraction.md"
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

      Scenario: Bulk update of book type and publisher without altering other fields
        Given The user is authenticated in the application
        When The user selects four books, checks only "Type" ("Manga") and "Publisher" ("Glénat"), and confirms the bulk update
        Then All four books are updated to type "Manga" and publisher "Glénat" while their respective titles, ISBNs, authors, and collections remain unchanged

traceability:
  local_key: "TEST-001-08-01"
  use_case_key: "UC-001"
  sub_use_case_key: "SUC-001-08"
  source_spec: "openspec/changes/book-series-and-missing-volumes/specs/book-catalog/spec.md"
  source_requirement: "Requirement: Modifier plusieurs livres en lot"
  automated_tests:
    - "server/test/books.test.ts"
    - "server/test/db.test.ts"
    - "web/src/App.test.tsx"
```
