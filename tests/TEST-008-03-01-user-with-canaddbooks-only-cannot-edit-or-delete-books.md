# [TEST-008-03-01] User with canAddBooks only cannot edit or delete books

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-008-03-01"
  issue_type: "Test"
  summary: "User with canAddBooks only cannot edit or delete books"
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
        target_key: "SUC-008-03"
        target_issue_type: "Sub Use Case"
        target_summary: "User authentication, permissions, and deployment - Granular role-based access control on book addition, modification, and deletion"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-008-03-granular-role-based-book-permissions.md"
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

      Scenario: User with canAddBooks only cannot edit or delete books
        Given The application container is running
        When A user granted only canAddBooks is logged in
        Then The user can browse the library and add books, while edit and delete actions are hidden in the UI and rejected with HTTP 403 by the API

traceability:
  local_key: "TEST-008-03-01"
  use_case_key: "UC-008"
  sub_use_case_key: "SUC-008-03"
  source_spec: "openspec/changes/user-auth-and-permissions/specs/user-auth/spec.md"
  source_requirement: "Requirement: Contrôle granulaire des autorisations sur les livres"
  automated_tests:
    - "server/test/auth-users.test.ts"
    - "server/test/health.test.ts"
    - "server/test/e2e.test.ts"
    - "web/src/App.test.tsx"
```
