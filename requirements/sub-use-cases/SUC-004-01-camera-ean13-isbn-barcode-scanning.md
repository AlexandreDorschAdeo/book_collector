# [SUC-004-01] ISBN barcode and cover metadata lookup - Camera EAN-13 / ISBN-13 barcode scanning in browser

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-004-01"
  issue_type: "Sub Use Case"
  summary: "ISBN barcode and cover metadata lookup - Camera EAN-13 / ISBN-13 barcode scanning in browser"
  status: "Nouveau"
  priority: "Highest"
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
    The system SHALL provide the user with the ability to scan a book's EAN-13 (ISBN-13) barcode using the device camera directly in the web browser and fallback to manual entry if camera access is unavailable.
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
        target_key: "TEST-004-01-01"
        target_summary: "Automatic lookup triggered upon successful camera barcode scan"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-01-01-automatic-lookup-triggered-upon-successful-camera-barcode-scan.md"
        scenario:
          when: "The user holds a readable ISBN barcode in front of the device camera"
          then: "The system decodes the ISBN and automatically triggers the bibliographic metadata lookup"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-004-01-02"
        target_summary: "Graceful fallback to manual ISBN input when camera permission is denied"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-01-02-graceful-fallback-to-manual-isbn-input-when-camera-permission-is.md"
        scenario:
          when: "Camera access is denied or unavailable on the user device"
          then: "The system informs the user and provides manual ISBN input"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canAddBooks)"
  statement: >-
    The system SHALL provide the user with the ability to scan a book's EAN-13 (ISBN-13) barcode using the device camera directly in the web browser and fallback to manual entry if camera access is unavailable.
  traceability:
    local_key: "SUC-004-01"
    parent_use_case: "UC-004"
    source_spec: "openspec/specs/isbn-scan-lookup/spec.md"
    source_requirement: "Requirement: Scan du code-barre ISBN"
```
