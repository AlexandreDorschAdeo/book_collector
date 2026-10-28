# [SUC-007-03] Daily automated backup and full restoration - Self-contained backup bundle including books, series, covers, users, and settings

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-007-03"
  issue_type: "Sub Use Case"
  summary: "Daily automated backup and full restoration - Self-contained backup bundle including books, series, covers, users, and settings"
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
    The system SHALL include in every backup file the complete library dataset: books (including series and volume number), book-collection links, series configurations (latest published volume count), base64-encoded cover image files, collections, metadata cache, user accounts with permissions, and application settings.
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
        target_key: "TEST-007-03-01"
        target_summary: "Export all entities, series configurations, and base64 cover images in backup bundle"
        target_status: "Validated"
        target_file: "../../tests/TEST-007-03-01-export-all-entities-series-configurations-and-base64-cover-images.md"
        scenario:
          when: "A backup bundle is generated"
          then: "The resulting JSON file contains all collections, books (with series and volume number), series configurations, book-collection links, cover images, users, and application settings"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    The system SHALL include in every backup file the complete library dataset: books (including series and volume number), book-collection links, series configurations (latest published volume count), base64-encoded cover image files, collections, metadata cache, user accounts with permissions, and application settings.
  traceability:
    local_key: "SUC-007-03"
    parent_use_case: "UC-007"
    source_spec: "openspec/changes/book-series-and-missing-volumes/specs/backup-and-restore/spec.md"
    source_requirement: "Requirement: Contenu intégral et autonome du fichier de sauvegarde"
```
