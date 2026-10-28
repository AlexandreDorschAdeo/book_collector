# [TEST-005-05-01] Analyze cover photo, pre-fill best match, and retain captured cover image

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-005-05-01"
  issue_type: "Test"
  summary: "Analyze cover photo, pre-fill best match, and retain captured cover image"
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

      Scenario: Analyze cover photo, pre-fill best match, and retain captured cover image
        Given The user is authenticated in the application
        When The user captures or uploads a cover photo on the Add Book screen and triggers cover analysis
        Then The system keeps the captured image as the book cover, extracts textual clues, queries bibliographic sources, and pre-fills the form with the matched book and its duplicate status

traceability:
  local_key: "TEST-005-05-01"
  use_case_key: "UC-005"
  sub_use_case_key: "SUC-005-05"
  source_spec: "openspec/specs/book-covers/spec.md"
  source_requirement: "Requirement: Identification d'un livre à partir d'une photo de couverture"
  automated_tests:
    - "server/test/cover-lookup.test.ts"
    - "server/test/books.test.ts"
    - "web/src/App.test.tsx"
```
