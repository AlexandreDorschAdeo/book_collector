# [UC-002] Book series and missing volumes management

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 1

jira:
  key: "UC-002"
  issue_type: "Use Case"
  summary: "Book series and missing volumes management"
  status: "Prêt"
  priority: "Highest"
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
    A collector groups books by series and volume number, configures the latest published volume, filters incomplete series, and copies missing volume lists.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-002-01"
        target_issue_type: "Sub Use Case"
        target_summary: "Book series and missing volumes management - Case- and accent-insensitive series grouping and volume sorting"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-002-01-group-books-by-normalized-series-and-volume.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-002-02"
        target_issue_type: "Sub Use Case"
        target_summary: "Book series and missing volumes management - Automatic missing volumes calculation in series numbering"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-002-02-automatic-missing-volumes-calculation.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-002-03"
        target_issue_type: "Sub Use Case"
        target_summary: "Book series and missing volumes management - Latest published volume configuration per series"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-002-03-configure-latest-published-volume-count.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-002-04"
        target_issue_type: "Sub Use Case"
        target_summary: "Book series and missing volumes management - Dedicated series screen, incomplete series filter, and one-click missing volumes copy"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-002-04-series-screen-filtering-and-missing-export.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-01-01"
        target_summary: "Case- and accent-insensitive series aggregation"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-01-01-case-and-accent-insensitive-series-aggregation.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-02-01"
        target_summary: "Detect intermediate missing volume gaps between owned volumes"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-02-01-detect-intermediate-missing-volume-gaps-between-owned-volumes.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-02-02"
        target_summary: "Complete series up to highest owned volume"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-02-02-complete-series-up-to-highest-owned-volume.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-03-01"
        target_summary: "Set latest published volume count higher than highest owned volume"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-03-01-set-latest-published-volume-count-higher-than-highest-owned-volum.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-03-02"
        target_summary: "Clear latest published volume count to revert to highest owned volume"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-03-02-clear-latest-published-volume-count-to-revert-to-highest-owned-vo.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-04-01"
        target_summary: "Filter series list to display only incomplete series"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-04-01-filter-series-list-to-display-only-incomplete-series.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-04-02"
        target_summary: "Copy formatted missing volumes summary to clipboard"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-04-02-copy-formatted-missing-volumes-summary-to-clipboard.md"

ireb:
  actor: "Collector / Authenticated User"
  obligation: "SHALL"
  business_goal: >-
    Group books belonging to the same story into an ordered series by volume number and automatically identify missing volumes for second-hand bookshop hunting, online marketplaces, or gift lists.
  preconditions:
    - "The user is authenticated in the application."
    - "One or more books have a series name assigned."
  postconditions:
    - "Series summaries display owned volumes, missing volume gaps, and trailing missing volumes up to the configured latest published volume."
  traceability:
    local_key: "UC-002"
    source_specs:
      - "openspec/changes/book-series-and-missing-volumes/specs/series-management/spec.md"
```
