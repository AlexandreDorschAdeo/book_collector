# [SUC-007-01] Daily automated backup and full restoration - Automatic daily backup creation or update on book additions or modifications

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-007-01"
  issue_type: "Sub Use Case"
  summary: "Daily automated backup and full restoration - Automatic daily backup creation or update on book additions or modifications"
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
    When at least one book or series target is added, modified, or moved on a given calendar day (YYYY-MM-DD), the system SHALL automatically create or update a single daily backup file named "backup-YYYY-MM-DD.json", and SHALL NOT generate a daily backup file on days without any mutation.
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
        target_key: "TEST-007-01-01"
        target_summary: "Create daily backup file upon book creation or modification"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-01-01-create-daily-backup-file-upon-book-creation-or-modification.md"
        scenario:
          when: "A user adds a new book or modifies an existing book on a given date (YYYY-MM-DD)"
          then: "The system creates or updates \"backup-YYYY-MM-DD.json\" in the backups directory with the current library state"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-01-02"
        target_summary: "Update the same daily backup file across multiple modifications on the same day"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-01-02-update-the-same-daily-backup-file-across-multiple-modifications-o.md"
        scenario:
          when: "Multiple books are added, edited, or moved during the same calendar day (YYYY-MM-DD)"
          then: "The system updates the single \"backup-YYYY-MM-DD.json\" file to reflect the latest state without creating duplicate files for that date"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-007-01-03"
        target_summary: "No daily backup generated on days without book mutations"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-01-03-no-daily-backup-generated-on-days-without-book-mutations.md"
        scenario:
          when: "No book addition or modification occurs during a calendar day"
          then: "No new daily backup file is generated for that day"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    When at least one book or series target is added, modified, or moved on a given calendar day (YYYY-MM-DD), the system SHALL automatically create or update a single daily backup file named "backup-YYYY-MM-DD.json", and SHALL NOT generate a daily backup file on days without any mutation.
  traceability:
    local_key: "SUC-007-01"
    parent_use_case: "UC-007"
    source_spec: "openspec/specs/backup-and-restore/spec.md"
    source_requirement: "Requirement: Sauvegarde quotidienne automatique lors d'ajouts ou modifications de livres"
```
