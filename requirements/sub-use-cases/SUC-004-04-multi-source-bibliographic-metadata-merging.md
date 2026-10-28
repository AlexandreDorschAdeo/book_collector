# [SUC-004-04] ISBN barcode and cover metadata lookup - Multi-source bibliographic metadata merging (BnF, Google Books, Open Library)

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-004-04"
  issue_type: "Sub Use Case"
  summary: "ISBN barcode and cover metadata lookup - Multi-source bibliographic metadata merging (BnF, Google Books, Open Library)"
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
    - "isbn-scan-lookup"
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
    The system SHALL query multiple complementary bibliographic sources and merge their responses so that fields missing from a primary source are completed by secondary sources.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-004"
        target_issue_type: "Use Case"
        target_summary: "ISBN barcode and cover metadata lookup"
        target_status: "Prêt"
        target_file: "../use-cases/UC-004-isbn-barcode-and-cover-metadata-lookup.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-004-04-01"
        target_summary: "Combine BnF text metadata with Open Library or Google Books cover image"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-04-01-combine-bnf-text-metadata-with-open-library-or-google-books-cover.md"
        scenario:
          when: "A primary source returns the title, publisher, and writer/illustrator roles without a cover image, and a secondary source provides a cover image for the same ISBN"
          then: "The merged lookup result combines the complete metadata from the first source with the cover image from the second source"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    The system SHALL query multiple complementary bibliographic sources and merge their responses so that fields missing from a primary source are completed by secondary sources.
  traceability:
    local_key: "SUC-004-04"
    parent_use_case: "UC-004"
    source_spec: "openspec/specs/isbn-scan-lookup/spec.md"
    source_requirement: "Requirement: Fusion multi-sources des métadonnées ISBN"
```
