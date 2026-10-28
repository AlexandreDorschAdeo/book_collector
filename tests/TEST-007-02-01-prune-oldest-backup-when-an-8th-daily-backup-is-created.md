# [TEST-007-02-01] Prune oldest backup when an 8th daily backup is created

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-007-02-01"
  issue_type: "Test"
  summary: "Prune oldest backup when an 8th daily backup is created"
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
        target_key: "SUC-007-02"
        target_issue_type: "Sub Use Case"
        target_summary: "Daily automated backup and full restoration - Rolling retention of the 7 most recent daily backup files"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-007-02-rolling-7-day-backup-retention.md"
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

      Scenario: Prune oldest backup when an 8th daily backup is created
        Given A book mutation occurs (for automatic trigger) or an administrator accesses the Settings screen
        When An 8th automatic daily backup is saved while 7 earlier daily backups exist
        Then The system retains the 7 most recent daily backups and deletes the oldest one

traceability:
  local_key: "TEST-007-02-01"
  use_case_key: "UC-007"
  sub_use_case_key: "SUC-007-02"
  source_spec: "openspec/specs/backup-and-restore/spec.md"
  source_requirement: "Requirement: Rétention glissante des 7 derniers jours de sauvegarde"
  automated_tests:
    - "server/test/backup.test.ts"
    - "web/src/App.test.tsx"
```
