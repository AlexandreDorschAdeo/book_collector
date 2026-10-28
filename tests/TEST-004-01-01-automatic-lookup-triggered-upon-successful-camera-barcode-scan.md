# [TEST-004-01-01] Automatic lookup triggered upon successful camera barcode scan

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-004-01-01"
  issue_type: "Test"
  summary: "Automatic lookup triggered upon successful camera barcode scan"
  status: "Validated"
  priority: "Highest"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "xray"
    - "isbn-scan-lookup"
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
        target_key: "SUC-004-01"
        target_issue_type: "Sub Use Case"
        target_summary: "ISBN barcode and cover metadata lookup - Camera EAN-13 / ISBN-13 barcode scanning in browser"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-004-01-camera-ean13-isbn-barcode-scanning.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-004"
        target_issue_type: "Use Case"
        target_summary: "ISBN barcode and cover metadata lookup"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-004-isbn-barcode-and-cover-metadata-lookup.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: ISBN barcode and cover metadata lookup

      Scenario: Automatic lookup triggered upon successful camera barcode scan
        Given The user is authenticated with canAddBooks permission
        When The user holds a readable ISBN barcode in front of the device camera
        Then The system decodes the ISBN and automatically triggers the bibliographic metadata lookup

traceability:
  local_key: "TEST-004-01-01"
  use_case_key: "UC-004"
  sub_use_case_key: "SUC-004-01"
  source_spec: "openspec/specs/isbn-scan-lookup/spec.md"
  source_requirement: "Requirement: Scan du code-barre ISBN"
  automated_tests:
    - "server/test/isbn.test.ts"
    - "server/test/metadata.test.ts"
    - "server/test/cover-lookup.test.ts"
```
