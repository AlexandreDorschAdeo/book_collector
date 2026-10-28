# [SUC-004-03] ISBN barcode and cover metadata lookup - Automatic metadata, author roles, series, and volume retrieval by ISBN

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-004-03"
  issue_type: "Sub Use Case"
  summary: "ISBN barcode and cover metadata lookup - Automatic metadata, author roles, series, and volume retrieval by ISBN"
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
    When an ISBN is looked up, the system SHALL automatically retrieve the title, subtitle, series name, volume number (extracted from UNIMARC series fields or title/subtitle patterns), authors with their roles (writer, illustrator, author), publisher, and cover image, and pre-fill them in the editable form.
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
        target_key: "TEST-004-03-01"
        target_summary: "Pre-fill editable form when ISBN is found in metadata providers"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-03-01-pre-fill-editable-form-when-isbn-is-found-in-metadata-providers.md"
        scenario:
          when: "The looked-up ISBN is found in at least one bibliographic provider"
          then: "The add-book form is pre-populated with available title, subtitle, series, volume number, authors, publisher, and cover preview, remaining editable before submission"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-004-03-02"
        target_summary: "Automatic extraction of series name and volume number from ISBN metadata"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-03-02-automatic-extraction-of-series-name-and-volume-number-from-isbn-m.md"
        scenario:
          when: "The ISBN metadata contains a series mention or volume pattern such as \"One Piece - Tome 12\" or a UNIMARC series zone with volume number"
          then: "The system automatically pre-fills the \"Series\" field (\"One Piece\") and \"Volume number\" field (12) in the form"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-004-03-03"
        target_summary: "Present blank editable form with pre-filled ISBN when lookup returns no match"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-03-03-present-blank-editable-form-with-pre-filled-isbn-when-lookup-retu.md"
        scenario:
          when: "No metadata provider returns a match or providers are unreachable"
          then: "The system presents an empty editable form with the ISBN pre-filled for manual entry"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "System"
  statement: >-
    When an ISBN is looked up, the system SHALL automatically retrieve the title, subtitle, series name, volume number (extracted from UNIMARC series fields or title/subtitle patterns), authors with their roles (writer, illustrator, author), publisher, and cover image, and pre-fill them in the editable form.
  traceability:
    local_key: "SUC-004-03"
    parent_use_case: "UC-004"
    source_spec: "openspec/changes/book-series-and-missing-volumes/specs/isbn-scan-lookup/spec.md"
    source_requirement: "Requirement: Récupération des métadonnées"
```
