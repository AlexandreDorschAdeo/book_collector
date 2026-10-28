# [SUC-007-02] Daily automated backup and full restoration - Rolling retention of the 7 most recent daily backup files

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-007-02"
  issue_type: "Sub Use Case"
  summary: "Daily automated backup and full restoration - Rolling retention of the 7 most recent daily backup files"
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
    When a new daily backup is written, the system SHALL retain at most the 7 most recent daily backup files on the server and automatically prune older daily backup files.
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
        target_key: "TEST-007-02-01"
        target_summary: "Prune oldest backup when an 8th daily backup is created"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-02-01-prune-oldest-backup-when-an-8th-daily-backup-is-created.md"
        scenario:
          when: "An 8th automatic daily backup is saved while 7 earlier daily backups exist"
          then: "The system retains the 7 most recent daily backups and deletes the oldest one"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    When a new daily backup is written, the system SHALL retain at most the 7 most recent daily backup files on the server and automatically prune older daily backup files.
  traceability:
    local_key: "SUC-007-02"
    parent_use_case: "UC-007"
    source_spec: "openspec/specs/backup-and-restore/spec.md"
    source_requirement: "Requirement: Rétention glissante des 7 derniers jours de sauvegarde"
```
