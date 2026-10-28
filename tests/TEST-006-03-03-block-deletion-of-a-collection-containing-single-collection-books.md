# [TEST-006-03-03] Block deletion of a collection containing single-collection books

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-006-03-03"
  issue_type: "Test"
  summary: "Block deletion of a collection containing single-collection books"
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

      Scenario: Block deletion of a collection containing single-collection books
        Given The user is authenticated in the application
        When The user attempts to delete a collection containing a book that belongs to no other collection
        Then The system rejects the deletion and instructs the user to move or delete those books first

traceability:
  local_key: "TEST-006-03-03"
  use_case_key: "UC-006"
  sub_use_case_key: "SUC-006-03"
  source_spec: "openspec/specs/collection-management/spec.md"
  source_requirement: "Requirement: Modifier et supprimer une collection"
  automated_tests:
    - "server/test/collections.test.ts"
    - "web/src/App.test.tsx"
```
