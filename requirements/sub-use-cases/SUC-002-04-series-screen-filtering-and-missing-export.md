# [SUC-002-04] Book series and missing volumes management - Dedicated series screen, incomplete series filter, and one-click missing volumes copy

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-002-04"
  issue_type: "Sub Use Case"
  summary: "Book series and missing volumes management - Dedicated series screen, incomplete series filter, and one-click missing volumes copy"
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
    The system SHALL provide a dedicated "Series" screen allowing the user to search for a series, filter only series with missing volumes, and copy in one click a formatted summary of missing volumes for a single series or all incomplete series.
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
        target_key: "TEST-002-04-01"
        target_summary: "Filter series list to display only incomplete series"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-04-01-filter-series-list-to-display-only-incomplete-series.md"
        scenario:
          when: "The user enables the \"Series with missing volumes only\" filter on the Series screen"
          then: "Only series having at least one missing volume remain displayed"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-04-02"
        target_summary: "Copy formatted missing volumes summary to clipboard"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-04-02-copy-formatted-missing-volumes-summary-to-clipboard.md"
        scenario:
          when: "The user clicks the copy missing volumes button for a series or for all incomplete series"
          then: "The system generates and copies a concise text summary listing the series name and missing volume numbers ready to share"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Collector / Authenticated User"
  statement: >-
    The system SHALL provide a dedicated "Series" screen allowing the user to search for a series, filter only series with missing volumes, and copy in one click a formatted summary of missing volumes for a single series or all incomplete series.
  traceability:
    local_key: "SUC-002-04"
    parent_use_case: "UC-002"
    source_spec: "openspec/changes/book-series-and-missing-volumes/specs/series-management/spec.md"
    source_requirement: "Requirement: Écran dédié aux séries, filtres et copie de liste de manquants"
```
