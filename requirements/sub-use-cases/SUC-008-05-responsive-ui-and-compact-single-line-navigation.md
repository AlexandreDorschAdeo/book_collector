# [SUC-008-05] User authentication, permissions, and deployment - Responsive smartphone/tablet/desktop web UI and compact single-line navigation bar

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-008-05"
  issue_type: "Sub Use Case"
  summary: "User authentication, permissions, and deployment - Responsive smartphone/tablet/desktop web UI and compact single-line navigation bar"
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
    type_of_requirement: "Non-Functional"
  description: >-
    The system SHALL provide a touch-friendly responsive web interface usable on desktop, tablet, and smartphone without horizontal scrolling, featuring a compact single-line top navigation bar (icons-only with accessible labels on screens < 640px, icons with short labels on screens >= 640px).
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
        target_key: "TEST-008-05-01"
        target_summary: "Smartphone layout without horizontal scrolling or zoom"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-05-01-smartphone-layout-without-horizontal-scrolling-or-zoom.md"
        scenario:
          when: "The user opens the application on a smartphone screen"
          then: "Navigation, book lists, and forms fit the viewport without horizontal scrolling or manual zoom"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-008-05-02"
        target_summary: "Single-line compact navigation bar on mobile and tablet"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-05-02-single-line-compact-navigation-bar-on-mobile-and-tablet.md"
        scenario:
          when: "The user views the application header on a smartphone or tablet"
          then: "All navigation buttons fit on a single horizontal row with dedicated icons and accessible labels"

ireb:
  category: "Non-Functional - Quality (Usability & Responsiveness)"
  obligation: "SHALL"
  actor: "Collector / Authenticated User"
  statement: >-
    The system SHALL provide a touch-friendly responsive web interface usable on desktop, tablet, and smartphone without horizontal scrolling, featuring a compact single-line top navigation bar (icons-only with accessible labels on screens < 640px, icons with short labels on screens >= 640px).
  traceability:
    local_key: "SUC-008-05"
    parent_use_case: "UC-008"
    source_spec: "openspec/specs/web-deployment/spec.md"
    source_requirement: "Requirement: Interface web responsive & Navigation principale unifiée"
```
