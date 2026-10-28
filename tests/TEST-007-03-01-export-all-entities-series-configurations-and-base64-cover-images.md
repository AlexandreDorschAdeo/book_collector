# [TEST-007-03-01] Export all entities, series configurations, and base64 cover images in backup bundle

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-007-03-01"
  issue_type: "Test"
  summary: "Export all entities, series configurations, and base64 cover images in backup bundle"
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
        target_key: "SUC-007-03"
        target_issue_type: "Sub Use Case"
        target_summary: "Daily automated backup and full restoration - Self-contained backup bundle including books, series, covers, users, and settings"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-007-03-self-contained-backup-bundle-content.md"
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

      Scenario: Export all entities, series configurations, and base64 cover images in backup bundle
        Given A book mutation occurs (for automatic trigger) or an administrator accesses the Settings screen
        When A backup bundle is generated
        Then The resulting JSON file contains all collections, books (with series and volume number), series configurations, book-collection links, cover images, users, and application settings

traceability:
  local_key: "TEST-007-03-01"
  use_case_key: "UC-007"
  sub_use_case_key: "SUC-007-03"
  source_spec: "openspec/changes/book-series-and-missing-volumes/specs/backup-and-restore/spec.md"
  source_requirement: "Requirement: Contenu intégral et autonome du fichier de sauvegarde"
  automated_tests:
    - "server/test/backup.test.ts"
    - "web/src/App.test.tsx"
```
