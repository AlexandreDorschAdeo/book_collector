# [TEST-001-04-01] Filter collection books by type

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-001-04-01"
  issue_type: "Test"
  summary: "Filter collection books by type"
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
        target_key: "SUC-001-04"
        target_issue_type: "Sub Use Case"
        target_summary: "Book catalog management - Collection book listing, sorting, and type filtering"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-001-04-collection-book-listing-sorting-and-filtering.md"
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

      Scenario: Filter collection books by type
        Given The user is authenticated in the application
        When The user opens a collection and filters by book type "BD"
        Then Only books of type "BD" belonging to that collection are displayed

traceability:
  local_key: "TEST-001-04-01"
  use_case_key: "UC-001"
  sub_use_case_key: "SUC-001-04"
  source_spec: "openspec/specs/book-catalog/spec.md"
  source_requirement: "Requirement: Lister les livres d'une collection"
  automated_tests:
    - "server/test/books.test.ts"
    - "server/test/db.test.ts"
    - "web/src/App.test.tsx"
```
