# [TEST-005-02-01] Upload, preview, crop, and save a valid image file as book cover

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-005-02-01"
  issue_type: "Test"
  summary: "Upload, preview, crop, and save a valid image file as book cover"
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
        target_key: "SUC-005-02"
        target_issue_type: "Sub Use Case"
        target_summary: "Book cover acquisition and management - Cover addition or replacement from a local image file"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-005-02-cover-upload-from-image-file.md"
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

      Scenario: Upload, preview, crop, and save a valid image file as book cover
        Given The user is authenticated in the application
        When The user selects a valid JPEG, PNG, or WebP image file in the add or edit form
        Then The image is previewed, can be interactively cropped, and is saved as the book cover

traceability:
  local_key: "TEST-005-02-01"
  use_case_key: "UC-005"
  sub_use_case_key: "SUC-005-02"
  source_spec: "openspec/specs/book-covers/spec.md"
  source_requirement: "Requirement: Ajout de couverture par fichier image"
  automated_tests:
    - "server/test/cover-lookup.test.ts"
    - "server/test/books.test.ts"
    - "web/src/App.test.tsx"
```
