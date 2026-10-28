# [TEST-005-03-01] Capture cover photo from phone camera and save cropped area

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-005-03-01"
  issue_type: "Test"
  summary: "Capture cover photo from phone camera and save cropped area"
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
    - "book-covers"
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
        target_key: "SUC-005-03"
        target_issue_type: "Sub Use Case"
        target_summary: "Book cover acquisition and management - Direct camera cover photo capture and interactive cropping"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-005-03-camera-cover-capture-and-cropping.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-005"
        target_issue_type: "Use Case"
        target_summary: "Book cover acquisition and management"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-005-book-cover-acquisition-and-management.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: Book cover acquisition and management

      Scenario: Capture cover photo from phone camera and save cropped area
        Given The user is authenticated in the application
        When The user captures a cover photo, adjusts the crop frame, and confirms
        Then Only the cropped region is retained and stored as the book cover image

traceability:
  local_key: "TEST-005-03-01"
  use_case_key: "UC-005"
  sub_use_case_key: "SUC-005-03"
  source_spec: "openspec/specs/book-covers/spec.md"
  source_requirement: "Requirement: Prise de photo et recadrage de la couverture"
  automated_tests:
    - "server/test/cover-lookup.test.ts"
    - "server/test/books.test.ts"
    - "web/src/App.test.tsx"
```
