# [UC-007] Daily automated backup and full restoration

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 1

jira:
  key: "UC-007"
  issue_type: "Use Case"
  summary: "Daily automated backup and full restoration"
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
    - "backup-and-restore"
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
    The system automatically writes a self-contained daily backup file when books are added or modified, retains the 7 most recent daily backups, and enables an administrator to create, download, or restore backups.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-007-01"
        target_issue_type: "Sub Use Case"
        target_summary: "Daily automated backup and full restoration - Automatic daily backup creation or update on book additions or modifications"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-007-01-automatic-daily-backup-on-book-mutations.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-007-02"
        target_issue_type: "Sub Use Case"
        target_summary: "Daily automated backup and full restoration - Rolling retention of the 7 most recent daily backup files"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-007-02-rolling-7-day-backup-retention.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-007-03"
        target_issue_type: "Sub Use Case"
        target_summary: "Daily automated backup and full restoration - Self-contained backup bundle including books, series, covers, users, and settings"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-007-03-self-contained-backup-bundle-content.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-007-04"
        target_issue_type: "Sub Use Case"
        target_summary: "Daily automated backup and full restoration - Backup listing, manual on-demand backup creation, and file download"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-007-04-list-create-and-download-backups.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-007-05"
        target_issue_type: "Sub Use Case"
        target_summary: "Daily automated backup and full restoration - Transactional full restoration from server backup or uploaded backup file"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-007-05-restore-library-from-server-or-uploaded-file.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-01-01"
        target_summary: "Create daily backup file upon book creation or modification"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-01-01-create-daily-backup-file-upon-book-creation-or-modification.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-01-02"
        target_summary: "Update the same daily backup file across multiple modifications on the same day"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-01-02-update-the-same-daily-backup-file-across-multiple-modifications-o.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-01-03"
        target_summary: "No daily backup generated on days without book mutations"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-01-03-no-daily-backup-generated-on-days-without-book-mutations.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-02-01"
        target_summary: "Prune oldest backup when an 8th daily backup is created"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-02-01-prune-oldest-backup-when-an-8th-daily-backup-is-created.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-03-01"
        target_summary: "Export all entities, series configurations, and base64 cover images in backup bundle"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-03-01-export-all-entities-series-configurations-and-base64-cover-images.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-04-01"
        target_summary: "Trigger manual backup from Settings screen and display metadata"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-04-01-trigger-manual-backup-from-settings-screen-and-display-metadata.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-04-02"
        target_summary: "Download a backup file from the server list"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-04-02-download-a-backup-file-from-the-server-list.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-05-01"
        target_summary: "Restore library from a server backup after confirmation"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-05-01-restore-library-from-a-server-backup-after-confirmation.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-05-02"
        target_summary: "Restore library by uploading an external backup JSON file"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-05-02-restore-library-by-uploading-an-external-backup-json-file.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-05-03"
        target_summary: "Reject corrupted or invalid backup file without altering existing data"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-05-03-reject-corrupted-or-invalid-backup-file-without-altering-existing.md"

ireb:
  actor: "Administrator (canManageUsers) / System"
  obligation: "SHALL"
  business_goal: >-
    Ensure automatic daily backups of the library on every day with at least one book addition or modification, retain the last 7 daily backups, and allow administrators to download or restore a backup from the server or an external file.
  preconditions:
    - "A book mutation occurs (for automatic trigger) or an administrator accesses the Settings screen."
  postconditions:
    - "Self-contained JSON backup files (including base64 covers, series configs, books, collections, users, and settings) are stored on disk and can restore the entire library transactionally."
  traceability:
    local_key: "UC-007"
    source_specs:
      - "openspec/specs/backup-and-restore/spec.md"
      - "openspec/changes/book-series-and-missing-volumes/specs/backup-and-restore/spec.md"
```
