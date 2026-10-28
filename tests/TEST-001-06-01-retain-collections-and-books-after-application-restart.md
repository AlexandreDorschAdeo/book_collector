# [TEST-001-06-01] Retain collections and books after application restart

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-001-06-01"
  issue_type: "Test"
  summary: "Retain collections and books after application restart"
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
        target_key: "SUC-001-06"
        target_issue_type: "Sub Use Case"
        target_summary: "Book catalog management - Catalog data persistence across application restarts"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-001-06-catalog-data-persistence.md"
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

      Scenario: Retain collections and books after application restart
        Given The user is authenticated in the application
        When The application is restarted
        Then All previously registered collections and books remain available

traceability:
  local_key: "TEST-001-06-01"
  use_case_key: "UC-001"
  sub_use_case_key: "SUC-001-06"
  source_spec: "openspec/specs/book-catalog/spec.md"
  source_requirement: "Requirement: Persistance des données"
  automated_tests:
    - "server/test/books.test.ts"
    - "server/test/db.test.ts"
    - "web/src/App.test.tsx"
```
