# [TEST-008-01-01] Block unauthenticated access with HTTP 401 and display login screen

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-008-01-01"
  issue_type: "Test"
  summary: "Block unauthenticated access with HTTP 401 and display login screen"
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
        target_key: "SUC-008-01"
        target_issue_type: "Sub Use Case"
        target_summary: "User authentication, permissions, and deployment - Mandatory username and password authentication for application and API access"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-008-01-mandatory-authentication-for-app-and-api.md"
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

      Scenario: Block unauthenticated access with HTTP 401 and display login screen
        Given The application container is running
        When An unauthenticated visitor opens the web application or calls a protected API route
        Then The API returns HTTP 401 and the web UI displays only the login screen

traceability:
  local_key: "TEST-008-01-01"
  use_case_key: "UC-008"
  sub_use_case_key: "SUC-008-01"
  source_spec: "openspec/changes/user-auth-and-permissions/specs/user-auth/spec.md"
  source_requirement: "Requirement: Authentification obligatoire pour l'accès à l'application"
  automated_tests:
    - "server/test/auth-users.test.ts"
    - "server/test/health.test.ts"
    - "server/test/e2e.test.ts"
    - "web/src/App.test.tsx"
```
