# [TEST-002-03-01] Set latest published volume count higher than highest owned volume

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-002-03-01"
  issue_type: "Test"
  summary: "Set latest published volume count higher than highest owned volume"
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
        target_key: "SUC-002-03"
        target_issue_type: "Sub Use Case"
        target_summary: "Book series and missing volumes management - Latest published volume configuration per series"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-002-03-configure-latest-published-volume-count.md"
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

      Scenario: Set latest published volume count higher than highest owned volume
        Given The user is authenticated in the application
        When A series owns volumes 1, 2, and 4 and the user sets the latest published volume count to 7
        Then The system reports volumes 3, 5, 6, and 7 in the missing volumes list for that series

traceability:
  local_key: "TEST-002-03-01"
  use_case_key: "UC-002"
  sub_use_case_key: "SUC-002-03"
  source_spec: "openspec/changes/book-series-and-missing-volumes/specs/series-management/spec.md"
  source_requirement: "Requirement: Configuration du dernier tome paru par série"
  automated_tests:
    - "server/test/books.test.ts"
    - "web/src/App.test.tsx"
```
