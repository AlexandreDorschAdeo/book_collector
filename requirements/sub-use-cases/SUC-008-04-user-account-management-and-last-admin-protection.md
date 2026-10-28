# [SUC-008-04] User authentication, permissions, and deployment - User account and permission management with last-administrator protection

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-008-04"
  issue_type: "Sub Use Case"
  summary: "User authentication, permissions, and deployment - User account and permission management with last-administrator protection"
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
    The system SHALL provide users holding canManageUsers with the ability to create users, update their permissions, reset their passwords, and delete user accounts, while prohibiting deletion or demotion of the last remaining administrator.
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
        target_key: "TEST-008-04-01"
        target_summary: "Create new user account with custom permissions and hashed password"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-04-01-create-new-user-account-with-custom-permissions-and-hashed-passwo.md"
        scenario:
          when: "An administrator creates a user in the Settings screen with selected permissions and password"
          then: "The new user is persisted with a hashed password and can immediately log in with the assigned permissions"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-008-04-02"
        target_summary: "Prevent deletion or demotion of the last administrator account"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-04-02-prevent-deletion-or-demotion-of-the-last-administrator-account.md"
        scenario:
          when: "An administrator attempts to delete the last account holding canManageUsers or revoke its canManageUsers permission"
          then: "The system rejects the operation and preserves at least one administrator account"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Administrator (canManageUsers)"
  statement: >-
    The system SHALL provide users holding canManageUsers with the ability to create users, update their permissions, reset their passwords, and delete user accounts, while prohibiting deletion or demotion of the last remaining administrator.
  traceability:
    local_key: "SUC-008-04"
    parent_use_case: "UC-008"
    source_spec: "openspec/changes/user-auth-and-permissions/specs/user-auth/spec.md"
    source_requirement: "Requirement: Gestion des utilisateurs et de leurs droits"
```
