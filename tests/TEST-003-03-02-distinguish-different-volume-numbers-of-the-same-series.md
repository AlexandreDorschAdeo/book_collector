# [TEST-003-03-02] Distinguish different volume numbers of the same series

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-003-03-02"
  issue_type: "Test"
  summary: "Distinguish different volume numbers of the same series"
  status: "Validated"
  priority: "High"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "xray"
    - "duplicate-detection"
  reporter: null
  assignee: null
  resolution: "Non résolu"
  votes: 0
  time_tracking:
    original_estimate: null
    remaining_estimate: null
    time_spent: null
  attachments: []
  custom_fields:
    test_level: "Acceptance test"
    sanity_check: "Yes"
    regression_test: "Yes"
  issue_links:
    tests:
      - link_type: "Test"
        relationship: "tests"
        target_key: "SUC-003-03"
        target_issue_type: "Sub Use Case"
        target_summary: "Duplicate and alternative edition detection - Case-, accent-, punctuation-, and article-insensitive comparison with distinct volume handling"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-003-03-tolerant-title-author-and-volume-comparison.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-003"
        target_issue_type: "Use Case"
        target_summary: "Duplicate and alternative edition detection"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-003-duplicate-and-edition-detection.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: Duplicate and alternative edition detection

      Scenario: Distinguish different volume numbers of the same series
        Given The user is on the Add Book / Scan screen and scans an ISBN, analyzes a cover, or enters title and author
        When The owned book is "One Piece, tome 1" and the scanned book is "One Piece, tome 2" by the same author
        Then The system does not flag them as duplicates or alternative editions of the same work

traceability:
  local_key: "TEST-003-03-02"
  use_case_key: "UC-003"
  sub_use_case_key: "SUC-003-03"
  source_spec: "openspec/specs/duplicate-detection/spec.md"
  source_requirement: "Requirement: Comparaison tolérante du titre et de l'auteur"
  automated_tests:
    - "server/test/lookup-check.test.ts"
    - "server/test/normalize.test.ts"
```
