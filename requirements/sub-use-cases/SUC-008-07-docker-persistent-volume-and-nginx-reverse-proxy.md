# [SUC-008-07] User authentication, permissions, and deployment - Docker Compose deployment, persistent volume, HTTPS camera access, and Nginx reverse proxy support

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-008-07"
  issue_type: "Sub Use Case"
  summary: "User authentication, permissions, and deployment - Docker Compose deployment, persistent volume, HTTPS camera access, and Nginx reverse proxy support"
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
    The system SHALL deploy via a single "docker compose up" command with a persistent /data volume, support HTTPS camera access, and honor X-Forwarded-For and X-Forwarded-Proto headers when running behind an Nginx HTTPS reverse proxy in a Proxmox LXC container.
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
        target_key: "TEST-008-07-01"
        target_summary: "Start application with docker compose up and preserve data across container recreation"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-07-01-start-application-with-docker-compose-up-and-preserve-data-across.md"
        scenario:
          when: "The operator runs \"docker compose up -d\" and later recreates the container on the same volume"
          then: "The web application is reachable and all collections, books, covers, and backups remain intact"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-008-07-02"
        target_summary: "Honor X-Forwarded-Proto and X-Forwarded-For behind Nginx HTTPS proxy"
        target_status: "Validated"
        target_file: "../../tests/TEST-008-07-02-honor-x-forwarded-proto-and-x-forwarded-for-behind-nginx-https-pr.md"
        scenario:
          when: "A client accesses the application over HTTPS through Nginx forwarding X-Forwarded-Proto: https and X-Forwarded-For"
          then: "The application identifies the real client IP for login rate-limiting and issues Secure HttpOnly session cookies"

ireb:
  category: "Non-Functional - Constraint (Deployment & Infrastructure)"
  obligation: "SHALL"
  actor: "System Operator"
  statement: >-
    The system SHALL deploy via a single "docker compose up" command with a persistent /data volume, support HTTPS camera access, and honor X-Forwarded-For and X-Forwarded-Proto headers when running behind an Nginx HTTPS reverse proxy in a Proxmox LXC container.
  traceability:
    local_key: "SUC-008-07"
    parent_use_case: "UC-008"
    source_spec: "openspec/changes/user-auth-and-permissions/specs/web-deployment/spec.md"
    source_requirement: "Requirement: Déploiement Docker, Volume persistant, HTTPS & Compatibilité Reverse Proxy HTTPS"
```
