# [UC-005] Book cover acquisition and management

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 1

jira:
  key: "UC-005"
  issue_type: "Use Case"
  summary: "Book cover acquisition and management"
  status: "Prêt"
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
    A collector acquires, crops, previews, displays, replaces, or removes locally stored book cover images.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-005-01"
        target_issue_type: "Sub Use Case"
        target_summary: "Book cover acquisition and management - Automatic cover retrieval by ISBN and local storage on book save"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-005-01-automatic-cover-retrieval-and-local-storage.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-005-02"
        target_issue_type: "Sub Use Case"
        target_summary: "Book cover acquisition and management - Cover addition or replacement from a local image file"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-005-02-cover-upload-from-image-file.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-005-03"
        target_issue_type: "Sub Use Case"
        target_summary: "Book cover acquisition and management - Direct camera cover photo capture and interactive cropping"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-005-03-camera-cover-capture-and-cropping.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-005-04"
        target_issue_type: "Sub Use Case"
        target_summary: "Book cover acquisition and management - Cover thumbnail display in catalog and cover removal"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-005-04-cover-thumbnail-display-and-removal.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-005-05"
        target_issue_type: "Sub Use Case"
        target_summary: "Book cover acquisition and management - Book identification from captured cover photo with candidate switching"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-005-05-book-identification-from-cover-photo.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-01-01"
        target_summary: "Preview and locally store cover image found via ISBN lookup"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-01-01-preview-and-locally-store-cover-image-found-via-isbn-lookup.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-01-02"
        target_summary: "Offer file upload or camera capture when no cover is found for ISBN"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-01-02-offer-file-upload-or-camera-capture-when-no-cover-is-found-for-is.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-02-01"
        target_summary: "Upload, preview, crop, and save a valid image file as book cover"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-02-01-upload-preview-crop-and-save-a-valid-image-file-as-book-cover.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-03-01"
        target_summary: "Capture cover photo from phone camera and save cropped area"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-03-01-capture-cover-photo-from-phone-camera-and-save-cropped-area.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-04-01"
        target_summary: "Display cover thumbnail across catalog and global search results"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-04-01-display-cover-thumbnail-across-catalog-and-global-search-results.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-04-02"
        target_summary: "Remove cover image during book editing and fallback to placeholder"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-04-02-remove-cover-image-during-book-editing-and-fallback-to-placeholde.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-05-01"
        target_summary: "Analyze cover photo, pre-fill best match, and retain captured cover image"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-05-01-analyze-cover-photo-pre-fill-best-match-and-retain-captured-cover.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-05-02"
        target_summary: "Switch between multiple bibliographic candidates while preserving captured cover photo"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-05-02-switch-between-multiple-bibliographic-candidates-while-preserving.md"

ireb:
  actor: "Collector / Authenticated User"
  obligation: "SHALL"
  business_goal: >-
    Associate a cover image with each book (retrieved automatically by ISBN, uploaded from a file, or photographed and cropped) and store it locally for catalog display.
  preconditions:
    - "The user is authenticated in the application."
  postconditions:
    - "Cover images are stored locally on disk and displayed across catalog lists, search results, and detail views."
  traceability:
    local_key: "UC-005"
    source_specs:
      - "openspec/specs/book-covers/spec.md"
```
