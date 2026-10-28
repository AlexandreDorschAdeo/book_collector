# [TEST-005-05-02] Switch between multiple bibliographic candidates while preserving captured cover photo

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-005-05-02"
  issue_type: "Test"
  summary: "Switch between multiple bibliographic candidates while preserving captured cover photo"
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
        target_key: "SUC-005-05"
        target_issue_type: "Sub Use Case"
        target_summary: "Book cover acquisition and management - Book identification from captured cover photo with candidate switching"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-005-05-book-identification-from-cover-photo.md"
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

      Scenario: Switch between multiple bibliographic candidates while preserving captured cover photo
        Given The user is authenticated in the application
        When Cover analysis returns multiple candidate books or editions from bibliographic providers
        Then The system pre-fills the best match and allows the user to switch to another candidate in one click while keeping the captured cover image

traceability:
  local_key: "TEST-005-05-02"
  use_case_key: "UC-005"
  sub_use_case_key: "SUC-005-05"
  source_spec: "openspec/specs/book-covers/spec.md"
  source_requirement: "Requirement: Identification d'un livre à partir d'une photo de couverture"
  automated_tests:
    - "server/test/cover-lookup.test.ts"
    - "server/test/books.test.ts"
    - "web/src/App.test.tsx"
```
