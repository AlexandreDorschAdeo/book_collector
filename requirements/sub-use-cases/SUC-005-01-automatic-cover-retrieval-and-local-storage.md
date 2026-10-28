# [SUC-005-01] Book cover acquisition and management - Automatic cover retrieval by ISBN and local storage on book save

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-005-01"
  issue_type: "Sub Use Case"
  summary: "Book cover acquisition and management - Automatic cover retrieval by ISBN and local storage on book save"
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
    When a bibliographic provider returns a cover URL during ISBN lookup, the system SHALL display a cover preview in the form and download a local copy of the image when the book is saved.
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
        target_key: "TEST-005-01-01"
        target_summary: "Preview and locally store cover image found via ISBN lookup"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-01-01-preview-and-locally-store-cover-image-found-via-isbn-lookup.md"
        scenario:
          when: "The user scans or enters an ISBN for which a bibliographic source provides a cover image"
          then: "The cover preview is displayed in the form and downloaded to local storage upon book creation"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-01-02"
        target_summary: "Offer file upload or camera capture when no cover is found for ISBN"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-01-02-offer-file-upload-or-camera-capture-when-no-cover-is-found-for-is.md"
        scenario:
          when: "No bibliographic source provides a cover image for the looked-up ISBN"
          then: "The form displays an empty cover placeholder allowing local file upload or camera capture"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    When a bibliographic provider returns a cover URL during ISBN lookup, the system SHALL display a cover preview in the form and download a local copy of the image when the book is saved.
  traceability:
    local_key: "SUC-005-01"
    parent_use_case: "UC-005"
    source_spec: "openspec/specs/book-covers/spec.md"
    source_requirement: "Requirement: Récupération automatique de la couverture par ISBN"
```
