# [TEST-001-01-04] Rejection of book registration when mandatory fields are missing

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-001-01-04"
  issue_type: "Test"
  summary: "Rejection of book registration when mandatory fields are missing"
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
        target_key: "SUC-001-01"
        target_issue_type: "Sub Use Case"
        target_summary: "Book catalog management - Book registration with metadata, author roles, series, and volume"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-001-01-register-book-with-metadata-and-series.md"
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

      Scenario: Rejection of book registration when mandatory fields are missing
        Given The user is authenticated in the application
        When The user submits a book registration without a title, without at least one author, or without at least one collection
        Then The system rejects the registration and highlights the missing mandatory fields

traceability:
  local_key: "TEST-001-01-04"
  use_case_key: "UC-001"
  sub_use_case_key: "SUC-001-01"
  source_spec: "openspec/changes/book-series-and-missing-volumes/specs/book-catalog/spec.md"
  source_requirement: "Requirement: Enregistrer un livre"
  automated_tests:
    - "server/test/books.test.ts"
    - "server/test/db.test.ts"
    - "web/src/App.test.tsx"
```
