# [TEST-008-06-02] Display Owl & Book vector emblem in header and /icon.svg

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-008-06-02"
  issue_type: "Test"
  summary: "Display Owl & Book vector emblem in header and /icon.svg"
  status: "Validated"
  priority: "Medium"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "xray"
    - "user-auth"
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
        target_key: "SUC-008-06"
        target_issue_type: "Sub Use Case"
        target_summary: "User authentication, permissions, and deployment - Progressive Web App installability and Owl & Book vector visual identity"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-008-06-pwa-installability-and-owl-book-emblem.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-008"
        target_issue_type: "Use Case"
        target_summary: "User authentication, permissions, and deployment"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-008-user-authentication-permissions-and-deployment.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: User authentication, permissions, and deployment

      Scenario: Display Owl & Book vector emblem in header and /icon.svg
        Given The application container is running
        When The user loads the application or inspects its favicon/PWA icon
        Then The vector emblem combining the owl head and open book is rendered in the header and served at /icon.svg

traceability:
  local_key: "TEST-008-06-02"
  use_case_key: "UC-008"
  sub_use_case_key: "SUC-008-06"
  source_spec: "openspec/specs/web-deployment/spec.md"
  source_requirement: "Requirement: Installable sur l'écran d'accueil & Identité visuelle chouette et livre"
  automated_tests:
    - "server/test/auth-users.test.ts"
    - "server/test/health.test.ts"
    - "server/test/e2e.test.ts"
    - "web/src/App.test.tsx"
```
