# [SUC-002-03] Book series and missing volumes management - Latest published volume configuration per series

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-002-03"
  issue_type: "Sub Use Case"
  summary: "Book series and missing volumes management - Latest published volume configuration per series"
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
    - "series-management"
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
    The system SHALL provide an authorized user with the ability to set, update, or clear the total number of published volumes (latest published volume) for any series so that all unowned volumes beyond the highest owned volume up to that target are reported as missing.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-002"
        target_issue_type: "Use Case"
        target_summary: "Book series and missing volumes management"
        target_status: "Prêt"
        target_file: "../use-cases/UC-002-book-series-and-missing-volumes.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-03-01"
        target_summary: "Set latest published volume count higher than highest owned volume"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-03-01-set-latest-published-volume-count-higher-than-highest-owned-volum.md"
        scenario:
          when: "A series owns volumes 1, 2, and 4 and the user sets the latest published volume count to 7"
          then: "The system reports volumes 3, 5, 6, and 7 in the missing volumes list for that series"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-03-02"
        target_summary: "Clear latest published volume count to revert to highest owned volume"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-03-02-clear-latest-published-volume-count-to-revert-to-highest-owned-vo.md"
        scenario:
          when: "The user clears the latest published volume count on a series owning volumes 1, 2, and 4"
          then: "The system recalculates missing volumes up to the highest owned volume (only volume 3 remains reported as missing)"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canEditBooks)"
  statement: >-
    The system SHALL provide an authorized user with the ability to set, update, or clear the total number of published volumes (latest published volume) for any series so that all unowned volumes beyond the highest owned volume up to that target are reported as missing.
  traceability:
    local_key: "SUC-002-03"
    parent_use_case: "UC-002"
    source_spec: "openspec/changes/book-series-and-missing-volumes/specs/series-management/spec.md"
    source_requirement: "Requirement: Configuration du dernier tome paru par série"
```
