# [TEST-007-05-03] Reject corrupted or invalid backup file without altering existing data

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-007-05-03"
  issue_type: "Test"
  summary: "Reject corrupted or invalid backup file without altering existing data"
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
        target_key: "SUC-007-05"
        target_issue_type: "Sub Use Case"
        target_summary: "Daily automated backup and full restoration - Transactional full restoration from server backup or uploaded backup file"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-007-05-restore-library-from-server-or-uploaded-file.md"
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

      Scenario: Reject corrupted or invalid backup file without altering existing data
        Given A book mutation occurs (for automatic trigger) or an administrator accesses the Settings screen
        When An administrator attempts to upload and restore a corrupted or structurally invalid backup file
        Then The system rejects the restoration with an explicit error message and leaves existing library data untouched

traceability:
  local_key: "TEST-007-05-03"
  use_case_key: "UC-007"
  sub_use_case_key: "SUC-007-05"
  source_spec: "openspec/specs/backup-and-restore/spec.md"
  source_requirement: "Requirement: Restauration d'une sauvegarde depuis le serveur ou par import de fichier"
  automated_tests:
    - "server/test/backup.test.ts"
    - "web/src/App.test.tsx"
```
