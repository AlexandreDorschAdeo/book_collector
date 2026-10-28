# [SUC-008-06] User authentication, permissions, and deployment - Progressive Web App installability and Owl & Book vector visual identity

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-008-06"
  issue_type: "Sub Use Case"
  summary: "User authentication, permissions, and deployment - Progressive Web App installability and Owl & Book vector visual identity"
  status: "Nouveau"
  priority: "Medium"
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
    The system SHALL be installable as a Progressive Web App (PWA) on mobile home screens and SHALL display the custom Owl & Open Book vector emblem (/icon.svg) as favicon, PWA icon, and header logo.
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
        target_key: "TEST-008-06-01"
        target_summary: "Install application to mobile home screen via PWA manifest"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-06-01-install-application-to-mobile-home-screen-via-pwa-manifest.md"
        scenario:
          when: "The user accesses the application over HTTPS from a compatible mobile browser"
          then: "The browser offers to install the application onto the device home screen"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-008-06-02"
        target_summary: "Display Owl & Book vector emblem in header and /icon.svg"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-06-02-display-owl-book-vector-emblem-in-header-and-icon-svg.md"
        scenario:
          when: "The user loads the application or inspects its favicon/PWA icon"
          then: "The vector emblem combining the owl head and open book is rendered in the header and served at /icon.svg"

ireb:
  category: "Non-Functional - Quality (Usability & Branding)"
  obligation: "SHALL"
  actor: "Collector / Authenticated User"
  statement: >-
    The system SHALL be installable as a Progressive Web App (PWA) on mobile home screens and SHALL display the custom Owl & Open Book vector emblem (/icon.svg) as favicon, PWA icon, and header logo.
  traceability:
    local_key: "SUC-008-06"
    parent_use_case: "UC-008"
    source_spec: "openspec/specs/web-deployment/spec.md"
    source_requirement: "Requirement: Installable sur l'écran d'accueil & Identité visuelle chouette et livre"
```
