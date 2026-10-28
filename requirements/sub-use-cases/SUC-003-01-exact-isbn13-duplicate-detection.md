# [SUC-003-01] Duplicate and alternative edition detection - Exact ISBN-13 duplicate detection and collection attachment

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-003-01"
  issue_type: "Sub Use Case"
  summary: "Duplicate and alternative edition detection - Exact ISBN-13 duplicate detection and collection attachment"
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
    - "duplicate-detection"
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
    When an ISBN is identified, the system SHALL immediately report whether a book with the same ISBN-13 is already owned along with its collections and locations, and SHALL allow attaching the existing book to another collection or explicitly creating an additional copy.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-003"
        target_issue_type: "Use Case"
        target_summary: "Duplicate and alternative edition detection"
        target_status: "Prêt"
        target_file: "../use-cases/UC-003-duplicate-and-edition-detection.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-01-01"
        target_summary: "Alert when scanned ISBN-13 is already owned"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-01-01-alert-when-scanned-isbn-13-is-already-owned.md"
        scenario:
          when: "The user scans an ISBN already present in collection \"Living Room\""
          then: "The system displays \"You already own this book\" with collection \"Living Room\" and its location before any creation submission"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-01-02"
        target_summary: "Attach already owned book to a new collection without duplicating the record"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-01-02-attach-already-owned-book-to-a-new-collection-without-duplicating.md"
        scenario:
          when: "The user chooses to add the already owned book to a selected collection that does not yet contain it"
          then: "The existing book record is linked to the selected collection without creating a duplicate book entry"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-01-03"
        target_summary: "Explicitly register a second physical copy with the same ISBN"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-01-03-explicitly-register-a-second-physical-copy-with-the-same-isbn.md"
        scenario:
          when: "The user explicitly confirms registering an additional copy of an already owned ISBN"
          then: "A new distinct book record is created with the same ISBN"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "Collector / Authenticated User"
  statement: >-
    When an ISBN is identified, the system SHALL immediately report whether a book with the same ISBN-13 is already owned along with its collections and locations, and SHALL allow attaching the existing book to another collection or explicitly creating an additional copy.
  traceability:
    local_key: "SUC-003-01"
    parent_use_case: "UC-003"
    source_spec: "openspec/specs/duplicate-detection/spec.md"
    source_requirement: "Requirement: Détection d'un livre déjà possédé"
```
