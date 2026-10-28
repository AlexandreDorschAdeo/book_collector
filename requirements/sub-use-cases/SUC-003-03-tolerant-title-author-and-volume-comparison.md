# [SUC-003-03] Duplicate and alternative edition detection - Case-, accent-, punctuation-, and article-insensitive comparison with distinct volume handling

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-003-03"
  issue_type: "Sub Use Case"
  summary: "Duplicate and alternative edition detection - Case-, accent-, punctuation-, and article-insensitive comparison with distinct volume handling"
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
    - "duplicate-detection"
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
    The system SHALL compare full titles (title and subtitle) and authors (regardless of role) ignoring case, accents, punctuation, and leading articles, and SHALL treat distinct subtitles or volume numbers as distinct works.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-003"
        target_issue_type: "Use Case"
        target_summary: "Duplicate and alternative edition detection"
        target_status: "Prêt"
        target_file: "../use-cases/UC-003-duplicate-and-edition-detection.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-03-01"
        target_summary: "Match titles despite typographical, case, and accent differences"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-03-01-match-titles-despite-typographical-case-and-accent-differences.md"
        scenario:
          when: "The owned book is \"Astérix le Gaulois\" and the scanned book is \"ASTERIX LE GAULOIS\""
          then: "Both books are matched as the same title"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-03-02"
        target_summary: "Distinguish different volume numbers of the same series"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-03-02-distinguish-different-volume-numbers-of-the-same-series.md"
        scenario:
          when: "The owned book is \"One Piece, tome 1\" and the scanned book is \"One Piece, tome 2\" by the same author"
          then: "The system does not flag them as duplicates or alternative editions of the same work"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    The system SHALL compare full titles (title and subtitle) and authors (regardless of role) ignoring case, accents, punctuation, and leading articles, and SHALL treat distinct subtitles or volume numbers as distinct works.
  traceability:
    local_key: "SUC-003-03"
    parent_use_case: "UC-003"
    source_spec: "openspec/specs/duplicate-detection/spec.md"
    source_requirement: "Requirement: Comparaison tolérante du titre et de l'auteur"
```
