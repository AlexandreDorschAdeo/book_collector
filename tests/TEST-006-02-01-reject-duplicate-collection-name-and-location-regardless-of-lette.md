# [TEST-006-02-01] Reject duplicate collection name and location regardless of letter case

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-006-02-01"
  issue_type: "Test"
  summary: "Reject duplicate collection name and location regardless of letter case"
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
        target_key: "SUC-006-02"
        target_issue_type: "Sub Use Case"
        target_summary: "Physical collection and location management - Case-insensitive uniqueness of collection name and location pair"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-006-02-collection-name-and-location-uniqueness.md"
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

      Scenario: Reject duplicate collection name and location regardless of letter case
        Given The user is authenticated in the application
        When The user attempts to create collection "bd" at location "Living Room" while "BD" at "Living Room" already exists
        Then The system rejects the creation with an explicit duplicate error message

traceability:
  local_key: "TEST-006-02-01"
  use_case_key: "UC-006"
  sub_use_case_key: "SUC-006-02"
  source_spec: "openspec/specs/collection-management/spec.md"
  source_requirement: "Requirement: Unicité du nom de collection"
  automated_tests:
    - "server/test/collections.test.ts"
    - "web/src/App.test.tsx"
```
