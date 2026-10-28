# [TEST-005-04-01] Display cover thumbnail across catalog and global search results

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-005-04-01"
  issue_type: "Test"
  summary: "Display cover thumbnail across catalog and global search results"
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

      Scenario: Display cover thumbnail across catalog and global search results
        Given The user is authenticated in the application
        When A book has a saved cover image
        Then Its cover thumbnail is displayed in collection lists, global search results, and detail views

traceability:
  local_key: "TEST-005-04-01"
  use_case_key: "UC-005"
  sub_use_case_key: "SUC-005-04"
  source_spec: "openspec/specs/book-covers/spec.md"
  source_requirement: "Requirement: Affichage et suppression de la couverture"
  automated_tests:
    - "server/test/cover-lookup.test.ts"
    - "server/test/books.test.ts"
    - "web/src/App.test.tsx"
```
