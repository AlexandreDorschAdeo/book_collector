# [SUC-005-02] Book cover acquisition and management - Cover addition or replacement from a local image file

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-005-02"
  issue_type: "Sub Use Case"
  summary: "Book cover acquisition and management - Cover addition or replacement from a local image file"
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
    The system SHALL provide the user with the ability to add or replace a book cover by uploading a local image file (JPEG, PNG, or WebP) from a computer, tablet, or smartphone.
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
        target_key: "TEST-005-02-01"
        target_summary: "Upload, preview, crop, and save a valid image file as book cover"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-02-01-upload-preview-crop-and-save-a-valid-image-file-as-book-cover.md"
        scenario:
          when: "The user selects a valid JPEG, PNG, or WebP image file in the add or edit form"
          then: "The image is previewed, can be interactively cropped, and is saved as the book cover"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canAddBooks / canEditBooks)"
  statement: >-
    The system SHALL provide the user with the ability to add or replace a book cover by uploading a local image file (JPEG, PNG, or WebP) from a computer, tablet, or smartphone.
  traceability:
    local_key: "SUC-005-02"
    parent_use_case: "UC-005"
    source_spec: "openspec/specs/book-covers/spec.md"
    source_requirement: "Requirement: Ajout de couverture par fichier image"
```
