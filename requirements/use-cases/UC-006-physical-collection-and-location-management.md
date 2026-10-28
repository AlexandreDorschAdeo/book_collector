# [UC-006] Physical collection and location management

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 1

jira:
  key: "UC-006"
  issue_type: "Use Case"
  summary: "Physical collection and location management"
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
    - "collection-management"
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
    A collector creates, views, renames, relocates, and safely deletes physical book collections with real-time book counts.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-006-01"
        target_issue_type: "Sub Use Case"
        target_summary: "Physical collection and location management - Collection creation with mandatory name and optional location"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-006-01-create-collection-with-name-and-location.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-006-02"
        target_issue_type: "Sub Use Case"
        target_summary: "Physical collection and location management - Case-insensitive uniqueness of collection name and location pair"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-006-02-collection-name-and-location-uniqueness.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-006-03"
        target_issue_type: "Sub Use Case"
        target_summary: "Physical collection and location management - Collection renaming, location update, and orphan-safe deletion"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-006-03-edit-and-safe-delete-collection.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-006-04"
        target_issue_type: "Sub Use Case"
        target_summary: "Physical collection and location management - Collections list overview with location and book count"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-006-04-collections-overview-with-book-counts.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-01-01"
        target_summary: "Create collection with name and location"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-01-01-create-collection-with-name-and-location.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-01-02"
        target_summary: "Reject collection creation when name is empty"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-01-02-reject-collection-creation-when-name-is-empty.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-02-01"
        target_summary: "Reject duplicate collection name and location regardless of letter case"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-02-01-reject-duplicate-collection-name-and-location-regardless-of-lette.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-03-01"
        target_summary: "Delete an empty collection"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-03-01-delete-an-empty-collection.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-03-02"
        target_summary: "Delete a collection whose books all belong to other collections"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-03-02-delete-a-collection-whose-books-all-belong-to-other-collections.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-03-03"
        target_summary: "Block deletion of a collection containing single-collection books"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-03-03-block-deletion-of-a-collection-containing-single-collection-books.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-04-01"
        target_summary: "Display accurate book counters per collection"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-04-01-display-accurate-book-counters-per-collection.md"

ireb:
  actor: "Collector / Authenticated User"
  obligation: "SHALL"
  business_goal: >-
    Organize physical books into named collections, each associated with a physical location (room, house, shelf), while preventing orphaned books.
  preconditions:
    - "The user is authenticated in the application."
  postconditions:
    - "Collections and their locations are persisted in SQLite and enforce uniqueness and non-orphan rules."
  traceability:
    local_key: "UC-006"
    source_specs:
      - "openspec/specs/collection-management/spec.md"
```
