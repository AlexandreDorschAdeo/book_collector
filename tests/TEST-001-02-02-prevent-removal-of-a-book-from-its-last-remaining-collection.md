# [TEST-001-02-02] Prevent removal of a book from its last remaining collection

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-001-02-02"
  issue_type: "Test"
  summary: "Prevent removal of a book from its last remaining collection"
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
    - "book-catalog"
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
        target_key: "SUC-001-02"
        target_issue_type: "Sub Use Case"
        target_summary: "Book catalog management - Multi-collection membership and orphan book prevention"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-001-02-multi-collection-membership-and-orphan-prevention.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-001"
        target_issue_type: "Use Case"
        target_summary: "Book catalog management"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-001-book-catalog-management.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: Book catalog management

      Scenario: Prevent removal of a book from its last remaining collection
        Given The user is authenticated in the application
        When The user attempts to remove a book from the only collection it belongs to
        Then The system rejects the removal and prompts the user to either move the book to another collection or delete it

traceability:
  local_key: "TEST-001-02-02"
  use_case_key: "UC-001"
  sub_use_case_key: "SUC-001-02"
  source_spec: "openspec/specs/book-catalog/spec.md"
  source_requirement: "Requirement: Appartenance à plusieurs collections"
  automated_tests:
    - "server/test/books.test.ts"
    - "server/test/db.test.ts"
    - "web/src/App.test.tsx"
```
