# [SUC-005-05] Book cover acquisition and management - Book identification from captured cover photo with candidate switching

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-005-05"
  issue_type: "Sub Use Case"
  summary: "Book cover acquisition and management - Book identification from captured cover photo with candidate switching"
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
    The system SHALL allow the user to analyze a captured or uploaded cover photo to automatically look up bibliographic candidates and duplicate status while retaining the captured photo as the book's cover image.
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
        target_key: "TEST-005-05-01"
        target_summary: "Analyze cover photo, pre-fill best match, and retain captured cover image"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-05-01-analyze-cover-photo-pre-fill-best-match-and-retain-captured-cover.md"
        scenario:
          when: "The user captures or uploads a cover photo on the Add Book screen and triggers cover analysis"
          then: "The system keeps the captured image as the book cover, extracts textual clues, queries bibliographic sources, and pre-fills the form with the matched book and its duplicate status"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-05-02"
        target_summary: "Switch between multiple bibliographic candidates while preserving captured cover photo"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-05-02-switch-between-multiple-bibliographic-candidates-while-preserving.md"
        scenario:
          when: "Cover analysis returns multiple candidate books or editions from bibliographic providers"
          then: "The system pre-fills the best match and allows the user to switch to another candidate in one click while keeping the captured cover image"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canAddBooks)"
  statement: >-
    The system SHALL allow the user to analyze a captured or uploaded cover photo to automatically look up bibliographic candidates and duplicate status while retaining the captured photo as the book's cover image.
  traceability:
    local_key: "SUC-005-05"
    parent_use_case: "UC-005"
    source_spec: "openspec/specs/book-covers/spec.md"
    source_requirement: "Requirement: Identification d'un livre à partir d'une photo de couverture"
```
