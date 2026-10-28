# [SUC-007-04] Daily automated backup and full restoration - Backup listing, manual on-demand backup creation, and file download

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-007-04"
  issue_type: "Sub Use Case"
  summary: "Daily automated backup and full restoration - Backup listing, manual on-demand backup creation, and file download"
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
    The system SHALL provide an administrator with the ability to view the list of server backups, trigger an immediate manual backup, and download any backup file to their local device.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-007"
        target_issue_type: "Use Case"
        target_summary: "Daily automated backup and full restoration"
        target_status: "Prêt"
        target_file: "../use-cases/UC-007-daily-backup-and-full-restoration.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-04-01"
        target_summary: "Trigger manual backup from Settings screen and display metadata"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-04-01-trigger-manual-backup-from-settings-screen-and-display-metadata.md"
        scenario:
          when: "An administrator opens the Settings screen and clicks \"Create backup now\""
          then: "The system immediately generates or updates today's backup on the server and lists it with its date, file size, and book count"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-04-02"
        target_summary: "Download a backup file from the server list"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-04-02-download-a-backup-file-from-the-server-list.md"
        scenario:
          when: "An administrator clicks \"Download\" on a listed backup"
          then: "The browser downloads the complete JSON backup file to the user's device"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Administrator (canManageUsers)"
  statement: >-
    The system SHALL provide an administrator with the ability to view the list of server backups, trigger an immediate manual backup, and download any backup file to their local device.
  traceability:
    local_key: "SUC-007-04"
    parent_use_case: "UC-007"
    source_spec: "openspec/specs/backup-and-restore/spec.md"
    source_requirement: "Requirement: Consultation, création manuelle et téléchargement d'une sauvegarde"
```
