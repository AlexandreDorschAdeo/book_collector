# [TEST-005-01-01] Preview and locally store cover image found via ISBN lookup

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-005-01-01"
  issue_type: "Test"
  summary: "Preview and locally store cover image found via ISBN lookup"
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
        target_key: "SUC-005-01"
        target_issue_type: "Sub Use Case"
        target_summary: "Book cover acquisition and management - Automatic cover retrieval by ISBN and local storage on book save"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-005-01-automatic-cover-retrieval-and-local-storage.md"
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

      Scenario: Preview and locally store cover image found via ISBN lookup
        Given The user is authenticated in the application
        When The user scans or enters an ISBN for which a bibliographic source provides a cover image
        Then The cover preview is displayed in the form and downloaded to local storage upon book creation

traceability:
  local_key: "TEST-005-01-01"
  use_case_key: "UC-005"
  sub_use_case_key: "SUC-005-01"
  source_spec: "openspec/specs/book-covers/spec.md"
  source_requirement: "Requirement: Récupération automatique de la couverture par ISBN"
  automated_tests:
    - "server/test/cover-lookup.test.ts"
    - "server/test/books.test.ts"
    - "web/src/App.test.tsx"
```
