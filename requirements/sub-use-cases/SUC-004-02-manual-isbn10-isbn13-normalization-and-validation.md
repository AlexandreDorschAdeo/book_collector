# [SUC-004-02] ISBN barcode and cover metadata lookup - Manual ISBN-10 / ISBN-13 entry, checksum validation, and ISBN-13 normalization

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-004-02"
  issue_type: "Sub Use Case"
  summary: "ISBN barcode and cover metadata lookup - Manual ISBN-10 / ISBN-13 entry, checksum validation, and ISBN-13 normalization"
  status: "Nouveau"
  priority: "High"
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
    The system SHALL accept manual entry of an ISBN-10 or ISBN-13 (with or without hyphens), validate its check digit, and normalize valid values to ISBN-13.
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
        target_key: "TEST-004-02-01"
        target_summary: "Normalize valid ISBN-10 input into ISBN-13"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-02-01-normalize-valid-isbn-10-input-into-isbn-13.md"
        scenario:
          when: "The user enters a valid ISBN-10"
          then: "The system converts and processes it as its equivalent ISBN-13"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-004-02-02"
        target_summary: "Reject ISBN with invalid check digit"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-02-02-reject-isbn-with-invalid-check-digit.md"
        scenario:
          when: "The user enters an ISBN with an invalid check digit"
          then: "The system rejects the value and displays a validation error"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    The system SHALL accept manual entry of an ISBN-10 or ISBN-13 (with or without hyphens), validate its check digit, and normalize valid values to ISBN-13.
  traceability:
    local_key: "SUC-004-02"
    parent_use_case: "UC-004"
    source_spec: "openspec/specs/isbn-scan-lookup/spec.md"
    source_requirement: "Requirement: Saisie manuelle et normalisation de l'ISBN"
```
