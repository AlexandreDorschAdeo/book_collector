# [UC-003] Duplicate and alternative edition detection

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 1

jira:
  key: "UC-003"
  issue_type: "Use Case"
  summary: "Duplicate and alternative edition detection"
  status: "Prêt"
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
    During book lookup or manual entry, the system checks existing catalog records by ISBN-13 and normalized title/author to alert the collector of exact duplicates or alternative editions.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-003-01"
        target_issue_type: "Sub Use Case"
        target_summary: "Duplicate and alternative edition detection - Exact ISBN-13 duplicate detection and collection attachment"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-003-01-exact-isbn13-duplicate-detection.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-003-02"
        target_issue_type: "Sub Use Case"
        target_summary: "Duplicate and alternative edition detection - Alternative edition detection by matching author and title with different ISBN"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-003-02-alternative-edition-detection.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-003-03"
        target_issue_type: "Sub Use Case"
        target_summary: "Duplicate and alternative edition detection - Case-, accent-, punctuation-, and article-insensitive comparison with distinct volume handling"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-003-03-tolerant-title-author-and-volume-comparison.md"
      - link_type: "Relates"
        direction: ">>> relates to"
        target_key: "SUC-003-04"
        target_issue_type: "Sub Use Case"
        target_summary: "Duplicate and alternative edition detection - Immediate duplicate check feedback during scan and manual entry"
        target_status: "Nouveau"
        target_file: "../sub-use-cases/SUC-003-04-immediate-duplicate-feedback-in-scan-flow.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-01-01"
        target_summary: "Alert when scanned ISBN-13 is already owned"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-01-01-alert-when-scanned-isbn-13-is-already-owned.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-01-02"
        target_summary: "Attach already owned book to a new collection without duplicating the record"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-01-02-attach-already-owned-book-to-a-new-collection-without-duplicating.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-01-03"
        target_summary: "Explicitly register a second physical copy with the same ISBN"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-01-03-explicitly-register-a-second-physical-copy-with-the-same-isbn.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-02-01"
        target_summary: "Detect paperback scan when hardcover edition by same author is owned"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-02-01-detect-paperback-scan-when-hardcover-edition-by-same-author-is-ow.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-02-02"
        target_summary: "Do not flag books with identical title but different authors as alternative editions"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-02-02-do-not-flag-books-with-identical-title-but-different-authors-as-a.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-03-01"
        target_summary: "Match titles despite typographical, case, and accent differences"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-03-01-match-titles-despite-typographical-case-and-accent-differences.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-03-02"
        target_summary: "Distinguish different volume numbers of the same series"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-03-02-distinguish-different-volume-numbers-of-the-same-series.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-04-01"
        target_summary: "Display explicit non-duplicate confirmation when book is not owned"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-04-01-display-explicit-non-duplicate-confirmation-when-book-is-not-owne.md"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-003-04-02"
        target_summary: "Run alternative edition check on manual title and author entry without ISBN"
        target_status: "Validated"
        target_file: "../../tests/TEST-003-04-02-run-alternative-edition-check-on-manual-title-and-author-entry-wi.md"

ireb:
  actor: "Collector / Authenticated User"
  obligation: "SHALL"
  business_goal: >-
    Immediately inform the user during barcode scanning, cover analysis, or manual entry whether the book or another edition of the same work is already owned, preventing duplicate purchases.
  preconditions:
    - "The user is on the Add Book / Scan screen and scans an ISBN, analyzes a cover, or enters title and author."
  postconditions:
    - "Duplicate status is displayed before the user confirms book creation, allowing attachment to another collection or explicit creation of a second copy."
  traceability:
    local_key: "UC-003"
    source_specs:
      - "openspec/specs/duplicate-detection/spec.md"
```
