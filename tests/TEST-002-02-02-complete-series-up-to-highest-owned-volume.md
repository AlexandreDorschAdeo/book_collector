# [TEST-002-02-02] Complete series up to highest owned volume

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-002-02-02"
  issue_type: "Test"
  summary: "Complete series up to highest owned volume"
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
        target_key: "SUC-002-02"
        target_issue_type: "Sub Use Case"
        target_summary: "Book series and missing volumes management - Automatic missing volumes calculation in series numbering"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-002-02-automatic-missing-volumes-calculation.md"
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

      Scenario: Complete series up to highest owned volume
        Given The user is authenticated in the application
        When A series "Blacksad" contains owned volumes 1, 2, and 3 with no latest published volume configured
        Then The system indicates that the series has no known missing volumes

traceability:
  local_key: "TEST-002-02-02"
  use_case_key: "UC-002"
  sub_use_case_key: "SUC-002-02"
  source_spec: "openspec/changes/book-series-and-missing-volumes/specs/series-management/spec.md"
  source_requirement: "Requirement: Calcul automatique des tomes manquants dans la numérotation"
  automated_tests:
    - "server/test/books.test.ts"
    - "web/src/App.test.tsx"
```
