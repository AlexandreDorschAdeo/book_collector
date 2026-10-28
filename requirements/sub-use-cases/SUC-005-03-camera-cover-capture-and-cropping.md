# [SUC-005-03] Book cover acquisition and management - Direct camera cover photo capture and interactive cropping

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-005-03"
  issue_type: "Sub Use Case"
  summary: "Book cover acquisition and management - Direct camera cover photo capture and interactive cropping"
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
    - "book-covers"
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
    The system SHALL provide the user with the ability to capture a cover photo directly from the device camera and interactively crop the image before saving.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-005"
        target_issue_type: "Use Case"
        target_summary: "Book cover acquisition and management"
        target_status: "Prêt"
        target_file: "../use-cases/UC-005-book-cover-acquisition-and-management.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-03-01"
        target_summary: "Capture cover photo from phone camera and save cropped area"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-03-01-capture-cover-photo-from-phone-camera-and-save-cropped-area.md"
        scenario:
          when: "The user captures a cover photo, adjusts the crop frame, and confirms"
          then: "Only the cropped region is retained and stored as the book cover image"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canAddBooks / canEditBooks)"
  statement: >-
    The system SHALL provide the user with the ability to capture a cover photo directly from the device camera and interactively crop the image before saving.
  traceability:
    local_key: "SUC-005-03"
    parent_use_case: "UC-005"
    source_spec: "openspec/specs/book-covers/spec.md"
    source_requirement: "Requirement: Prise de photo et recadrage de la couverture"
```
