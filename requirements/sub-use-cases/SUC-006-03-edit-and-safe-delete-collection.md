# [SUC-006-03] Physical collection and location management - Collection renaming, location update, and orphan-safe deletion

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-006-03"
  issue_type: "Sub Use Case"
  summary: "Physical collection and location management - Collection renaming, location update, and orphan-safe deletion"
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
    The system SHALL allow an authorized user to rename a collection, update its location, and delete it only if it is empty or all its books also belong to at least one other collection.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-006"
        target_issue_type: "Use Case"
        target_summary: "Physical collection and location management"
        target_status: "Prêt"
        target_file: "../use-cases/UC-006-physical-collection-and-location-management.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-03-01"
        target_summary: "Delete an empty collection"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-03-01-delete-an-empty-collection.md"
        scenario:
          when: "The user deletes a collection containing zero books"
          then: "The collection is removed from the list"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-03-02"
        target_summary: "Delete a collection whose books all belong to other collections"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-03-02-delete-a-collection-whose-books-all-belong-to-other-collections.md"
        scenario:
          when: "The user deletes a collection whose books are all also assigned to at least one other collection"
          then: "The collection is deleted and its books remain available in their other collections"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-03-03"
        target_summary: "Block deletion of a collection containing single-collection books"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-03-03-block-deletion-of-a-collection-containing-single-collection-books.md"
        scenario:
          when: "The user attempts to delete a collection containing a book that belongs to no other collection"
          then: "The system rejects the deletion and instructs the user to move or delete those books first"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canEditBooks / canDeleteBooks)"
  statement: >-
    The system SHALL allow an authorized user to rename a collection, update its location, and delete it only if it is empty or all its books also belong to at least one other collection.
  traceability:
    local_key: "SUC-006-03"
    parent_use_case: "UC-006"
    source_spec: "openspec/specs/collection-management/spec.md"
    source_requirement: "Requirement: Modifier et supprimer une collection"
```
