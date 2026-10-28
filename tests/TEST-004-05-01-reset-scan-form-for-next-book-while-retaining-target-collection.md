# [TEST-004-05-01] Reset scan form for next book while retaining target collection

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-004-05-01"
  issue_type: "Test"
  summary: "Reset scan form for next book while retaining target collection"
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
        target_key: "SUC-004-05"
        target_issue_type: "Sub Use Case"
        target_summary: "ISBN barcode and cover metadata lookup - Continuous sequential scanning workflow with preserved target collection"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-004-05-continuous-sequential-barcode-scanning.md"
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

      Scenario: Reset scan form for next book while retaining target collection
        Given The user is authenticated with canAddBooks permission
        When The user finishes adding a book from the scan screen
        Then The scan screen resets ready for the next scan with the same target collection pre-selected

traceability:
  local_key: "TEST-004-05-01"
  use_case_key: "UC-004"
  sub_use_case_key: "SUC-004-05"
  source_spec: "openspec/specs/isbn-scan-lookup/spec.md"
  source_requirement: "Requirement: Enchaînement de scans"
  automated_tests:
    - "server/test/isbn.test.ts"
    - "server/test/metadata.test.ts"
    - "server/test/cover-lookup.test.ts"
```
