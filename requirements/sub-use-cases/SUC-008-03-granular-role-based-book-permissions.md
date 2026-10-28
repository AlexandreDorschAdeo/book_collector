# [SUC-008-03] User authentication, permissions, and deployment - Granular role-based access control on book addition, modification, and deletion

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-008-03"
  issue_type: "Sub Use Case"
  summary: "User authentication, permissions, and deployment - Granular role-based access control on book addition, modification, and deletion"
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
    The system SHALL enforce individual user permissions for adding books (canAddBooks), editing/moving books (canEditBooks), and deleting books (canDeleteBooks) both in the web UI and on server API endpoints (returning HTTP 403 when unauthorized).
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
        target_key: "TEST-008-03-01"
        target_summary: "User with canAddBooks only cannot edit or delete books"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-03-01-user-with-canaddbooks-only-cannot-edit-or-delete-books.md"
        scenario:
          when: "A user granted only canAddBooks is logged in"
          then: "The user can browse the library and add books, while edit and delete actions are hidden in the UI and rejected with HTTP 403 by the API"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-008-03-02"
        target_summary: "User with canEditBooks but without canDeleteBooks cannot delete books"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-03-02-user-with-caneditbooks-but-without-candeletebooks-cannot-delete-b.md"
        scenario:
          when: "A user granted canEditBooks but not canDeleteBooks is logged in"
          then: "The user can edit existing books but any book deletion request is rejected with HTTP 403"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "Authenticated User"
  statement: >-
    The system SHALL enforce individual user permissions for adding books (canAddBooks), editing/moving books (canEditBooks), and deleting books (canDeleteBooks) both in the web UI and on server API endpoints (returning HTTP 403 when unauthorized).
  traceability:
    local_key: "SUC-008-03"
    parent_use_case: "UC-008"
    source_spec: "openspec/changes/user-auth-and-permissions/specs/user-auth/spec.md"
    source_requirement: "Requirement: Contrôle granulaire des autorisations sur les livres"
```
