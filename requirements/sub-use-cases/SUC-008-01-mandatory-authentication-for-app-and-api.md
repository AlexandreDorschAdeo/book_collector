# [SUC-008-01] User authentication, permissions, and deployment - Mandatory username and password authentication for application and API access

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-008-01"
  issue_type: "Sub Use Case"
  summary: "User authentication, permissions, and deployment - Mandatory username and password authentication for application and API access"
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
    - "user-auth"
    - "web-deployment"
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
    The system SHALL require every user to authenticate with a valid username and password before viewing or modifying the library, returning HTTP 401 on unauthenticated API requests and displaying the login screen.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-008"
        target_issue_type: "Use Case"
        target_summary: "User authentication, permissions, and deployment"
        target_status: "Prêt"
        target_file: "../use-cases/UC-008-user-authentication-permissions-and-deployment.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-008-01-01"
        target_summary: "Block unauthenticated access with HTTP 401 and display login screen"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-01-01-block-unauthenticated-access-with-http-401-and-display-login-scre.md"
        scenario:
          when: "An unauthenticated visitor opens the web application or calls a protected API route"
          then: "The API returns HTTP 401 and the web UI displays only the login screen"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-008-01-02"
        target_summary: "Open authenticated session upon valid login and terminate on logout"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-01-02-open-authenticated-session-upon-valid-login-and-terminate-on-logo.md"
        scenario:
          when: "The user submits a valid username and password"
          then: "An authenticated session is established and the user accesses the application according to their permissions until logout"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "Visitor / Authenticated User"
  statement: >-
    The system SHALL require every user to authenticate with a valid username and password before viewing or modifying the library, returning HTTP 401 on unauthenticated API requests and displaying the login screen.
  traceability:
    local_key: "SUC-008-01"
    parent_use_case: "UC-008"
    source_spec: "openspec/changes/user-auth-and-permissions/specs/user-auth/spec.md"
    source_requirement: "Requirement: Authentification obligatoire pour l'accès à l'application"
```
