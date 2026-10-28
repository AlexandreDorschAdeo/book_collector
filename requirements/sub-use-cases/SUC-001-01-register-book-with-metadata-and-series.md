# [SUC-001-01] Book catalog management - Book registration with metadata, author roles, series, and volume

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-001-01"
  issue_type: "Sub Use Case"
  summary: "Book catalog management - Book registration with metadata, author roles, series, and volume"
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
    - "book-catalog"
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
    The system SHALL provide an authorized user with the ability to register a book with a mandatory title, an optional subtitle, an optional series name, an optional positive integer volume number, at least one author with a specific role (author, writer, or illustrator), a book type (book, bd, manga, or comic), at least one target collection, an optional ISBN, an optional publisher, and an optional cover image.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-001"
        target_issue_type: "Use Case"
        target_summary: "Book catalog management"
        target_status: "Prêt"
        target_file: "../use-cases/UC-001-book-catalog-management.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-01-01"
        target_summary: "Valid book registration with writer and illustrator roles"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-01-01-valid-book-registration-with-writer-and-illustrator-roles.md"
        scenario:
          when: "The user registers a graphic novel (BD) with a title, a subtitle, a writer, an illustrator, and a target collection"
          then: "The book is added to the target collection with its subtitle and the respective roles of its authors"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-01-02"
        target_summary: "Book registration with publisher and cover image"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-01-02-book-registration-with-publisher-and-cover-image.md"
        scenario:
          when: "The user registers a book with a publisher name and a cover image"
          then: "The book is persisted with its publisher and associated cover image"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-01-03"
        target_summary: "Book registration with series name and volume number"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-01-03-book-registration-with-series-name-and-volume-number.md"
        scenario:
          when: "The user registers a manga with series \"One Piece\" and volume number \"12\""
          then: "The book is persisted and displayed with series \"One Piece\" and volume number 12"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-001-01-04"
        target_summary: "Rejection of book registration when mandatory fields are missing"
        target_status: "Validated"
        target_file: "../../tests/TEST-001-01-04-rejection-of-book-registration-when-mandatory-fields-are-missing.md"
        scenario:
          when: "The user submits a book registration without a title, without at least one author, or without at least one collection"
          then: "The system rejects the registration and highlights the missing mandatory fields"

ireb:
  category: "Functional - User Interaction"
  obligation: "SHALL"
  actor: "Authenticated User (canAddBooks)"
  statement: >-
    The system SHALL provide an authorized user with the ability to register a book with a mandatory title, an optional subtitle, an optional series name, an optional positive integer volume number, at least one author with a specific role (author, writer, or illustrator), a book type (book, bd, manga, or comic), at least one target collection, an optional ISBN, an optional publisher, and an optional cover image.
  traceability:
    local_key: "SUC-001-01"
    parent_use_case: "UC-001"
    source_spec: "openspec/changes/book-series-and-missing-volumes/specs/book-catalog/spec.md"
    source_requirement: "Requirement: Enregistrer un livre"
```
