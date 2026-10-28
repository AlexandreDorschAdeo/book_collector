# [SUC-007-05] Daily automated backup and full restoration - Transactional full restoration from server backup or uploaded backup file

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-007-05"
  issue_type: "Sub Use Case"
  summary: "Daily automated backup and full restoration - Transactional full restoration from server backup or uploaded backup file"
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
    The system SHALL provide an administrator with the ability to restore the entire library either from a server-stored backup or from an uploaded external backup file, transactionally replacing books, collections, series configs, cover images, users, and settings and rebuilding the full-text search index.
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
        target_key: "TEST-007-05-01"
        target_summary: "Restore library from a server backup after confirmation"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-05-01-restore-library-from-a-server-backup-after-confirmation.md"
        scenario:
          when: "An administrator selects \"Restore\" on a listed server backup and confirms the operation"
          then: "The system restores all books, collections, series configs, cover image files, users, and settings to the backup state and rebuilds the full-text index"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-05-02"
        target_summary: "Restore library by uploading an external backup JSON file"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-05-02-restore-library-by-uploading-an-external-backup-json-file.md"
        scenario:
          when: "An administrator uploads a valid external backup file from their device and confirms restoration"
          then: "The system validates the bundle, restores all database records and cover images, and displays a confirmation message"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-05-03"
        target_summary: "Reject corrupted or invalid backup file without altering existing data"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-05-03-reject-corrupted-or-invalid-backup-file-without-altering-existing.md"
        scenario:
          when: "An administrator attempts to upload and restore a corrupted or structurally invalid backup file"
          then: "The system rejects the restoration with an explicit error message and leaves existing library data untouched"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Administrator (canManageUsers)"
  statement: >-
    The system SHALL provide an administrator with the ability to restore the entire library either from a server-stored backup or from an uploaded external backup file, transactionally replacing books, collections, series configs, cover images, users, and settings and rebuilding the full-text search index.
  traceability:
    local_key: "SUC-007-05"
    parent_use_case: "UC-007"
    source_spec: "openspec/specs/backup-and-restore/spec.md"
    source_requirement: "Requirement: Restauration d'une sauvegarde depuis le serveur ou par import de fichier"
```
