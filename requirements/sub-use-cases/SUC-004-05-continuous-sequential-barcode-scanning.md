# [SUC-004-05] ISBN barcode and cover metadata lookup - Continuous sequential scanning workflow with preserved target collection

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-004-05"
  issue_type: "Sub Use Case"
  summary: "ISBN barcode and cover metadata lookup - Continuous sequential scanning workflow with preserved target collection"
  status: "Nouveau"
  priority: "Medium"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "ireb"
    - "isbn-scan-lookup"
  reporter: null
  assignee: null
  resolution: "Non résolu"
  votes: 0
  time_tracking:
    original_estimate: null
    remaining_estimate: null
    time_spent: null
  custom_fields:
    type_of_requirement: "Functional"
  description: >-
    The system SHALL allow the user to scan and add multiple books consecutively without leaving the scan screen while keeping the previously selected target collection active.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-004"
        target_issue_type: "Use Case"
        target_summary: "ISBN barcode and cover metadata lookup"
        target_status: "Prêt"
        target_file: "../use-cases/UC-004-isbn-barcode-and-cover-metadata-lookup.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-004-05-01"
        target_summary: "Reset scan form for next book while retaining target collection"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-05-01-reset-scan-form-for-next-book-while-retaining-target-collection.md"
        scenario:
          when: "The user finishes adding a book from the scan screen"
          then: "The scan screen resets ready for the next scan with the same target collection pre-selected"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canAddBooks)"
  statement: >-
    The system SHALL allow the user to scan and add multiple books consecutively without leaving the scan screen while keeping the previously selected target collection active.
  traceability:
    local_key: "SUC-004-05"
    parent_use_case: "UC-004"
    source_spec: "openspec/specs/isbn-scan-lookup/spec.md"
    source_requirement: "Requirement: Enchaînement de scans"
```
