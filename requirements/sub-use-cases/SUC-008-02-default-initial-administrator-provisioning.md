# [SUC-008-02] User authentication, permissions, and deployment - Default initial administrator account provisioning on empty database

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-008-02"
  issue_type: "Sub Use Case"
  summary: "User authentication, permissions, and deployment - Default initial administrator account provisioning on empty database"
  status: "Nouveau"
  priority: "High"
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
    When the database is initialized with no existing user accounts, the system SHALL automatically provision a default "admin" account (password "1234") granted all permissions (canAddBooks, canEditBooks, canDeleteBooks, canManageUsers).
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
        target_key: "TEST-008-02-01"
        target_summary: "Log in with default admin account on first application startup"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-02-01-log-in-with-default-admin-account-on-first-application-startup.md"
        scenario:
          when: "The database is initialized for the first time"
          then: "The \"admin\" user can log in with password \"1234\" and holds all permissions"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    When the database is initialized with no existing user accounts, the system SHALL automatically provision a default "admin" account (password "1234") granted all permissions (canAddBooks, canEditBooks, canDeleteBooks, canManageUsers).
  traceability:
    local_key: "SUC-008-02"
    parent_use_case: "UC-008"
    source_spec: "openspec/changes/user-auth-and-permissions/specs/user-auth/spec.md"
    source_requirement: "Requirement: Utilisateur administrateur initial par défaut"
```
