# [SUC-005-04] Book cover acquisition and management - Cover thumbnail display in catalog and cover removal

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-005-04"
  issue_type: "Sub Use Case"
  summary: "Book cover acquisition and management - Cover thumbnail display in catalog and cover removal"
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
    The system SHALL display the cover thumbnail in collection lists, search results, and book cards, and SHALL allow an authorized user to remove or replace an existing book's cover.
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
        target_key: "TEST-005-04-01"
        target_summary: "Display cover thumbnail across catalog and global search results"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-04-01-display-cover-thumbnail-across-catalog-and-global-search-results.md"
        scenario:
          when: "A book has a saved cover image"
          then: "Its cover thumbnail is displayed in collection lists, global search results, and detail views"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-005-04-02"
        target_summary: "Remove cover image during book editing and fallback to placeholder"
        target_status: "Validated"
        target_file: "../../tests/TEST-005-04-02-remove-cover-image-during-book-editing-and-fallback-to-placeholde.md"
        scenario:
          when: "The user removes the cover image of a book while editing it"
          then: "The book is saved without a cover and a default placeholder visual is displayed"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Collector / Authenticated User"
  statement: >-
    The system SHALL display the cover thumbnail in collection lists, search results, and book cards, and SHALL allow an authorized user to remove or replace an existing book's cover.
  traceability:
    local_key: "SUC-005-04"
    parent_use_case: "UC-005"
    source_spec: "openspec/specs/book-covers/spec.md"
    source_requirement: "Requirement: Affichage et suppression de la couverture"
```
