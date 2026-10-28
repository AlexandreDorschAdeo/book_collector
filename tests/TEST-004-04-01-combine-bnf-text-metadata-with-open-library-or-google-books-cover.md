# [TEST-004-04-01] Combine BnF text metadata with Open Library or Google Books cover image

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-004-04-01"
  issue_type: "Test"
  summary: "Combine BnF text metadata with Open Library or Google Books cover image"
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
        target_key: "SUC-004-04"
        target_issue_type: "Sub Use Case"
        target_summary: "ISBN barcode and cover metadata lookup - Multi-source bibliographic metadata merging (BnF, Google Books, Open Library)"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-004-04-multi-source-bibliographic-metadata-merging.md"
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

      Scenario: Combine BnF text metadata with Open Library or Google Books cover image
        Given The user is authenticated with canAddBooks permission
        When A primary source returns the title, publisher, and writer/illustrator roles without a cover image, and a secondary source provides a cover image for the same ISBN
        Then The merged lookup result combines the complete metadata from the first source with the cover image from the second source

traceability:
  local_key: "TEST-004-04-01"
  use_case_key: "UC-004"
  sub_use_case_key: "SUC-004-04"
  source_spec: "openspec/specs/isbn-scan-lookup/spec.md"
  source_requirement: "Requirement: Fusion multi-sources des métadonnées ISBN"
  automated_tests:
    - "server/test/isbn.test.ts"
    - "server/test/metadata.test.ts"
    - "server/test/cover-lookup.test.ts"
```
