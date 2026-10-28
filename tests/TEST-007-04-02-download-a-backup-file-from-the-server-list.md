# [TEST-007-04-02] Download a backup file from the server list

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-007-04-02"
  issue_type: "Test"
  summary: "Download a backup file from the server list"
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
        target_key: "SUC-007-04"
        target_issue_type: "Sub Use Case"
        target_summary: "Daily automated backup and full restoration - Backup listing, manual on-demand backup creation, and file download"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-007-04-list-create-and-download-backups.md"
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

      Scenario: Download a backup file from the server list
        Given A book mutation occurs (for automatic trigger) or an administrator accesses the Settings screen
        When An administrator clicks "Download" on a listed backup
        Then The browser downloads the complete JSON backup file to the user's device

traceability:
  local_key: "TEST-007-04-02"
  use_case_key: "UC-007"
  sub_use_case_key: "SUC-007-04"
  source_spec: "openspec/specs/backup-and-restore/spec.md"
  source_requirement: "Requirement: Consultation, création manuelle et téléchargement d'une sauvegarde"
  automated_tests:
    - "server/test/backup.test.ts"
    - "web/src/App.test.tsx"
```
