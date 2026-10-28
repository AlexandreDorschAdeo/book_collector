# [SUC-006-01] Physical collection and location management - Collection creation with mandatory name and optional location

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-006-01"
  issue_type: "Sub Use Case"
  summary: "Physical collection and location management - Collection creation with mandatory name and optional location"
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
    The system SHALL provide an authorized user with the ability to create a collection with a mandatory name and an optional physical location.
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
        target_key: "TEST-006-01-01"
        target_summary: "Create collection with name and location"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-01-01-create-collection-with-name-and-location.md"
        scenario:
          when: "The user creates a collection named \"BD\" with location \"Living Room\""
          then: "The collection appears in the collections list with its name and location"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-006-01-02"
        target_summary: "Reject collection creation when name is empty"
        target_status: "Validated"
        target_file: "../../tests/TEST-006-01-02-reject-collection-creation-when-name-is-empty.md"
        scenario:
          when: "The user submits collection creation without a name"
          then: "The system rejects the creation and indicates that the collection name is mandatory"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canAddBooks / canEditBooks)"
  statement: >-
    The system SHALL provide an authorized user with the ability to create a collection with a mandatory name and an optional physical location.
  traceability:
    local_key: "SUC-006-01"
    parent_use_case: "UC-006"
    source_spec: "openspec/specs/collection-management/spec.md"
    source_requirement: "Requirement: Créer une collection"
```
