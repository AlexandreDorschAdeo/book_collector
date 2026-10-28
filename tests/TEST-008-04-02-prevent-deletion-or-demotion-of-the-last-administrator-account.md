# [TEST-008-04-02] Prevent deletion or demotion of the last administrator account

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-008-04-02"
  issue_type: "Test"
  summary: "Prevent deletion or demotion of the last administrator account"
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

      Scenario: Prevent deletion or demotion of the last administrator account
        Given The application container is running
        When An administrator attempts to delete the last account holding canManageUsers or revoke its canManageUsers permission
        Then The system rejects the operation and preserves at least one administrator account

traceability:
  local_key: "TEST-008-04-02"
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
