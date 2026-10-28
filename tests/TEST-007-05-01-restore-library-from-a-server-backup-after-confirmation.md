# [TEST-007-05-01] Restore library from a server backup after confirmation

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-007-05-01"
  issue_type: "Test"
  summary: "Restore library from a server backup after confirmation"
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

      Scenario: Restore library from a server backup after confirmation
        Given A book mutation occurs (for automatic trigger) or an administrator accesses the Settings screen
        When An administrator selects "Restore" on a listed server backup and confirms the operation
        Then The system restores all books, collections, series configs, cover image files, users, and settings to the backup state and rebuilds the full-text index

traceability:
  local_key: "TEST-007-05-01"
  use_case_key: "UC-007"
  sub_use_case_key: "SUC-007-05"
  source_spec: "openspec/specs/backup-and-restore/spec.md"
  source_requirement: "Requirement: Restauration d'une sauvegarde depuis le serveur ou par import de fichier"
  automated_tests:
    - "server/test/backup.test.ts"
    - "web/src/App.test.tsx"
```
