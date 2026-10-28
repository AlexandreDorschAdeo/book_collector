# [TEST-001-05-02] Empty search result notification

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-001-05-02"
  issue_type: "Test"
  summary: "Empty search result notification"
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
        target_key: "SUC-001-05"
        target_issue_type: "Sub Use Case"
        target_summary: "Book catalog management - Global case- and accent-insensitive search across all collections"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-001-05-global-full-text-catalog-search.md"
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

      Scenario: Empty search result notification
        Given The user is authenticated in the application
        When The search query matches no book in the catalog
        Then The system displays an explicit empty-state message indicating that no matching book was found

traceability:
  local_key: "TEST-001-05-02"
  use_case_key: "UC-001"
  sub_use_case_key: "SUC-001-05"
  source_spec: "openspec/changes/book-series-and-missing-volumes/specs/book-catalog/spec.md"
  source_requirement: "Requirement: Rechercher dans toutes les collections"
  automated_tests:
    - "server/test/books.test.ts"
    - "server/test/db.test.ts"
    - "web/src/App.test.tsx"
```
