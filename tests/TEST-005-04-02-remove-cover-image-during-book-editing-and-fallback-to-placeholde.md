# [TEST-005-04-02] Remove cover image during book editing and fallback to placeholder

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-005-04-02"
  issue_type: "Test"
  summary: "Remove cover image during book editing and fallback to placeholder"
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
        target_key: "SUC-005-04"
        target_issue_type: "Sub Use Case"
        target_summary: "Book cover acquisition and management - Cover thumbnail display in catalog and cover removal"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-005-04-cover-thumbnail-display-and-removal.md"
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

      Scenario: Remove cover image during book editing and fallback to placeholder
        Given The user is authenticated in the application
        When The user removes the cover image of a book while editing it
        Then The book is saved without a cover and a default placeholder visual is displayed

traceability:
  local_key: "TEST-005-04-02"
  use_case_key: "UC-005"
  sub_use_case_key: "SUC-005-04"
  source_spec: "openspec/specs/book-covers/spec.md"
  source_requirement: "Requirement: Affichage et suppression de la couverture"
  automated_tests:
    - "server/test/cover-lookup.test.ts"
    - "server/test/books.test.ts"
    - "web/src/App.test.tsx"
```
