# [TEST-008-04-01] Create new user account with custom permissions and hashed password

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-008-04-01"
  issue_type: "Test"
  summary: "Create new user account with custom permissions and hashed password"
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
        target_key: "SUC-008-04"
        target_issue_type: "Sub Use Case"
        target_summary: "User authentication, permissions, and deployment - User account and permission management with last-administrator protection"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-008-04-user-account-management-and-last-admin-protection.md"
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

      Scenario: Create new user account with custom permissions and hashed password
        Given The application container is running
        When An administrator creates a user in the Settings screen with selected permissions and password
        Then The new user is persisted with a hashed password and can immediately log in with the assigned permissions

traceability:
  local_key: "TEST-008-04-01"
  use_case_key: "UC-008"
  sub_use_case_key: "SUC-008-04"
  source_spec: "openspec/changes/user-auth-and-permissions/specs/user-auth/spec.md"
  source_requirement: "Requirement: Gestion des utilisateurs et de leurs droits"
  automated_tests:
    - "server/test/auth-users.test.ts"
    - "server/test/health.test.ts"
    - "server/test/e2e.test.ts"
    - "web/src/App.test.tsx"
```
