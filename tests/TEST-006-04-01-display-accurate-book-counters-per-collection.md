# [TEST-006-04-01] Display accurate book counters per collection

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-006-04-01"
  issue_type: "Test"
  summary: "Display accurate book counters per collection"
  status: "Validated"
  priority: "Medium"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "xray"
    - "collection-management"
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
        target_key: "SUC-006-04"
        target_issue_type: "Sub Use Case"
        target_summary: "Physical collection and location management - Collections list overview with location and book count"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-006-04-collections-overview-with-book-counts.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-006"
        target_issue_type: "Use Case"
        target_summary: "Physical collection and location management"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-006-physical-collection-and-location-management.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: Physical collection and location management

      Scenario: Display accurate book counters per collection
        Given The user is authenticated in the application
        When The user opens the collections screen
        Then Each collection displays its current number of assigned books

traceability:
  local_key: "TEST-006-04-01"
  use_case_key: "UC-006"
  sub_use_case_key: "SUC-006-04"
  source_spec: "openspec/specs/collection-management/spec.md"
  source_requirement: "Requirement: Aperçu des collections"
  automated_tests:
    - "server/test/collections.test.ts"
    - "web/src/App.test.tsx"
```
