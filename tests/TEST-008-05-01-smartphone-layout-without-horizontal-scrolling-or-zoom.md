# [TEST-008-05-01] Smartphone layout without horizontal scrolling or zoom

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-008-05-01"
  issue_type: "Test"
  summary: "Smartphone layout without horizontal scrolling or zoom"
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
        target_key: "SUC-008-05"
        target_issue_type: "Sub Use Case"
        target_summary: "User authentication, permissions, and deployment - Responsive smartphone/tablet/desktop web UI and compact single-line navigation bar"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-008-05-responsive-ui-and-compact-single-line-navigation.md"
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

      Scenario: Smartphone layout without horizontal scrolling or zoom
        Given The application container is running
        When The user opens the application on a smartphone screen
        Then Navigation, book lists, and forms fit the viewport without horizontal scrolling or manual zoom

traceability:
  local_key: "TEST-008-05-01"
  use_case_key: "UC-008"
  sub_use_case_key: "SUC-008-05"
  source_spec: "openspec/specs/web-deployment/spec.md"
  source_requirement: "Requirement: Interface web responsive & Navigation principale unifiée"
  automated_tests:
    - "server/test/auth-users.test.ts"
    - "server/test/health.test.ts"
    - "server/test/e2e.test.ts"
    - "web/src/App.test.tsx"
```
