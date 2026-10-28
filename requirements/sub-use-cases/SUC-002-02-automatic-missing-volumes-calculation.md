# [SUC-002-02] Book series and missing volumes management - Automatic missing volumes calculation in series numbering

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-002-02"
  issue_type: "Sub Use Case"
  summary: "Book series and missing volumes management - Automatic missing volumes calculation in series numbering"
  status: "Nouveau"
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
    The system SHALL automatically calculate the missing volumes of a series by identifying all positive integer volume numbers absent between volume 1 and the highest owned volume number (or the configured latest published volume count if greater).
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
        target_key: "TEST-002-02-01"
        target_summary: "Detect intermediate missing volume gaps between owned volumes"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-02-01-detect-intermediate-missing-volume-gaps-between-owned-volumes.md"
        scenario:
          when: "A series \"One Piece\" contains owned volumes 1, 2, and 5 with no latest published volume configured"
          then: "The system displays volumes 1, 2, and 5 as owned and flags volumes 3 and 4 as missing"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-002-02-02"
        target_summary: "Complete series up to highest owned volume"
        target_status: "Validated"
        target_file: "../../tests/TEST-002-02-02-complete-series-up-to-highest-owned-volume.md"
        scenario:
          when: "A series \"Blacksad\" contains owned volumes 1, 2, and 3 with no latest published volume configured"
          then: "The system indicates that the series has no known missing volumes"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    The system SHALL automatically calculate the missing volumes of a series by identifying all positive integer volume numbers absent between volume 1 and the highest owned volume number (or the configured latest published volume count if greater).
  traceability:
    local_key: "SUC-002-02"
    parent_use_case: "UC-002"
    source_spec: "openspec/changes/book-series-and-missing-volumes/specs/series-management/spec.md"
    source_requirement: "Requirement: Calcul automatique des tomes manquants dans la numérotation"
```
