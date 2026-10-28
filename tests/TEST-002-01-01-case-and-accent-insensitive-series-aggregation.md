# [TEST-002-01-01] Case- and accent-insensitive series aggregation

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-002-01-01"
  issue_type: "Test"
  summary: "Case- and accent-insensitive series aggregation"
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
        target_key: "SUC-002-01"
        target_issue_type: "Sub Use Case"
        target_summary: "Book series and missing volumes management - Case- and accent-insensitive series grouping and volume sorting"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-002-01-group-books-by-normalized-series-and-volume.md"
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

      Scenario: Case- and accent-insensitive series aggregation
        Given The user is authenticated in the application
        When Two books are registered with series names "One Piece" (volume 1) and "one piece" (volume 2)
        Then The series screen groups both books under a single "One Piece" series with volumes 1 and 2 ordered sequentially

traceability:
  local_key: "TEST-002-01-01"
  use_case_key: "UC-002"
  sub_use_case_key: "SUC-002-01"
  source_spec: "openspec/changes/book-series-and-missing-volumes/specs/series-management/spec.md"
  source_requirement: "Requirement: Regroupement des livres par série et numéro de tome"
  automated_tests:
    - "server/test/books.test.ts"
    - "web/src/App.test.tsx"
```
