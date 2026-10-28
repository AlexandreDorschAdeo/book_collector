# [TEST-008-07-01] Start application with docker compose up and preserve data across container recreation

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-008-07-01"
  issue_type: "Test"
  summary: "Start application with docker compose up and preserve data across container recreation"
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
        target_key: "SUC-008-07"
        target_issue_type: "Sub Use Case"
        target_summary: "User authentication, permissions, and deployment - Docker Compose deployment, persistent volume, HTTPS camera access, and Nginx reverse proxy support"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-008-07-docker-persistent-volume-and-nginx-reverse-proxy.md"
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

      Scenario: Start application with docker compose up and preserve data across container recreation
        Given The application container is running
        When The operator runs "docker compose up -d" and later recreates the container on the same volume
        Then The web application is reachable and all collections, books, covers, and backups remain intact

traceability:
  local_key: "TEST-008-07-01"
  use_case_key: "UC-008"
  sub_use_case_key: "SUC-008-07"
  source_spec: "openspec/changes/user-auth-and-permissions/specs/web-deployment/spec.md"
  source_requirement: "Requirement: Déploiement Docker, Volume persistant, HTTPS & Compatibilité Reverse Proxy HTTPS"
  automated_tests:
    - "server/test/auth-users.test.ts"
    - "server/test/health.test.ts"
    - "server/test/e2e.test.ts"
    - "web/src/App.test.tsx"
```
