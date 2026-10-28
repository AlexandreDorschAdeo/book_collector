# [TEST-002-04-01] Filter series list to display only incomplete series

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-002-04-01"
  issue_type: "Test"
  summary: "Filter series list to display only incomplete series"
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
    - "series-management"
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
        target_key: "SUC-002-04"
        target_issue_type: "Sub Use Case"
        target_summary: "Book series and missing volumes management - Dedicated series screen, incomplete series filter, and one-click missing volumes copy"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-002-04-series-screen-filtering-and-missing-export.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-002"
        target_issue_type: "Use Case"
        target_summary: "Book series and missing volumes management"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-002-book-series-and-missing-volumes.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: Book series and missing volumes management

      Scenario: Filter series list to display only incomplete series
        Given The user is authenticated in the application
        When The user enables the "Series with missing volumes only" filter on the Series screen
        Then Only series having at least one missing volume remain displayed

traceability:
  local_key: "TEST-002-04-01"
  use_case_key: "UC-002"
  sub_use_case_key: "SUC-002-04"
  source_spec: "openspec/changes/book-series-and-missing-volumes/specs/series-management/spec.md"
  source_requirement: "Requirement: Écran dédié aux séries, filtres et copie de liste de manquants"
  automated_tests:
    - "server/test/books.test.ts"
    - "web/src/App.test.tsx"
```
