# [TEST-006-03-02] Delete a collection whose books all belong to other collections

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-006-03-02"
  issue_type: "Test"
  summary: "Delete a collection whose books all belong to other collections"
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
        target_key: "SUC-006-03"
        target_issue_type: "Sub Use Case"
        target_summary: "Physical collection and location management - Collection renaming, location update, and orphan-safe deletion"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-006-03-edit-and-safe-delete-collection.md"
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

      Scenario: Delete a collection whose books all belong to other collections
        Given The user is authenticated in the application
        When The user deletes a collection whose books are all also assigned to at least one other collection
        Then The collection is deleted and its books remain available in their other collections

traceability:
  local_key: "TEST-006-03-02"
  use_case_key: "UC-006"
  sub_use_case_key: "SUC-006-03"
  source_spec: "openspec/specs/collection-management/spec.md"
  source_requirement: "Requirement: Modifier et supprimer une collection"
  automated_tests:
    - "server/test/collections.test.ts"
    - "web/src/App.test.tsx"
```
