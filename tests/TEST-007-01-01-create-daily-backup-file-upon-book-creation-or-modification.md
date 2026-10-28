# [TEST-007-01-01] Create daily backup file upon book creation or modification

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-007-01-01"
  issue_type: "Test"
  summary: "Create daily backup file upon book creation or modification"
  status: "Validated"
  priority: "Highest"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "xray"
    - "backup-and-restore"
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
        target_key: "SUC-007-01"
        target_issue_type: "Sub Use Case"
        target_summary: "Daily automated backup and full restoration - Automatic daily backup creation or update on book additions or modifications"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-007-01-automatic-daily-backup-on-book-mutations.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-007"
        target_issue_type: "Use Case"
        target_summary: "Daily automated backup and full restoration"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-007-daily-backup-and-full-restoration.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: Daily automated backup and full restoration

      Scenario: Create daily backup file upon book creation or modification
        Given A book mutation occurs (for automatic trigger) or an administrator accesses the Settings screen
        When A user adds a new book or modifies an existing book on a given date (YYYY-MM-DD)
        Then The system creates or updates "backup-YYYY-MM-DD.json" in the backups directory with the current library state

traceability:
  local_key: "TEST-007-01-01"
  use_case_key: "UC-007"
  sub_use_case_key: "SUC-007-01"
  source_spec: "openspec/specs/backup-and-restore/spec.md"
  source_requirement: "Requirement: Sauvegarde quotidienne automatique lors d'ajouts ou modifications de livres"
  automated_tests:
    - "server/test/backup.test.ts"
    - "web/src/App.test.tsx"
```
