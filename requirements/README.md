# IREB Business Requirements & Jira Traceability Matrix

This directory contains the business requirements extracted from the repository's **OpenSpec** specifications (`openspec/specs/` and `openspec/changes/`), formatted according to the **IREB (CPRE)** standard and structured for **Jira** import across two hierarchical levels:

1. **Level 1 — `Use Case`** (`requirements/use-cases/UC-*.md`)
2. **Level 2 — `Sub Use Case`** (`requirements/sub-use-cases/SUC-*.md`), linked to their parent `Use Case` via `Relates` (`relates to >>>`) and to their verifiable acceptance scenarios via `Test` (`is tested by`).
3. **Level 3 — `Test` (Jira / Xray Gherkin)** ([`../tests/TEST-*.md`](../tests/README.md)), linked bidirectionally (`tests` ↔ `is tested by`) to both `Sub Use Cases` and `Use Cases`.

---

## Summary Table

| Use Case Key | Use Case Summary | Sub Use Cases | Linked Tests (`is tested by`) | File |
| --- | --- | :---: | :---: | --- |
| **UC-001** | Book catalog management | 8 | 18 | [`use-cases/UC-001-book-catalog-management.md`](./use-cases/UC-001-book-catalog-management.md) |
| **UC-002** | Book series and missing volumes management | 4 | 7 | [`use-cases/UC-002-book-series-and-missing-volumes.md`](./use-cases/UC-002-book-series-and-missing-volumes.md) |
| **UC-003** | Duplicate and alternative edition detection | 4 | 9 | [`use-cases/UC-003-duplicate-and-edition-detection.md`](./use-cases/UC-003-duplicate-and-edition-detection.md) |
| **UC-004** | ISBN barcode and cover metadata lookup | 6 | 13 | [`use-cases/UC-004-isbn-barcode-and-cover-metadata-lookup.md`](./use-cases/UC-004-isbn-barcode-and-cover-metadata-lookup.md) |
| **UC-005** | Book cover acquisition and management | 5 | 8 | [`use-cases/UC-005-book-cover-acquisition-and-management.md`](./use-cases/UC-005-book-cover-acquisition-and-management.md) |
| **UC-006** | Physical collection and location management | 4 | 7 | [`use-cases/UC-006-physical-collection-and-location-management.md`](./use-cases/UC-006-physical-collection-and-location-management.md) |
| **UC-007** | Daily automated backup and full restoration | 5 | 10 | [`use-cases/UC-007-daily-backup-and-full-restoration.md`](./use-cases/UC-007-daily-backup-and-full-restoration.md) |
| **UC-008** | User authentication, permissions, and deployment | 7 | 13 | [`use-cases/UC-008-user-authentication-permissions-and-deployment.md`](./use-cases/UC-008-user-authentication-permissions-and-deployment.md) |

**Total**: **8** Use Cases · **43** Sub Use Cases · **85** Test Scenarios

---

## Detailed Hierarchy

### [UC-001] Book catalog management
- **File**: [`use-cases/UC-001-book-catalog-management.md`](./use-cases/UC-001-book-catalog-management.md)
- **Type of requirement**: `Functional` | **Priority**: `Highest` | **Status**: `Prêt`
- **Sub Use Cases (`>>> relates to`)**:
  - **[SUC-001-01]** [Book catalog management - Book registration with metadata, author roles, series, and volume](./sub-use-cases/SUC-001-01-register-book-with-metadata-and-series.md) *(4 test(s))* 
  - **[SUC-001-02]** [Book catalog management - Multi-collection membership and orphan book prevention](./sub-use-cases/SUC-001-02-multi-collection-membership-and-orphan-prevention.md) *(2 test(s))* 
  - **[SUC-001-03]** [Book catalog management - Modal book editing, moving, and deletion with automatic focus](./sub-use-cases/SUC-001-03-modal-book-edit-move-and-delete.md) *(3 test(s))* 
  - **[SUC-001-04]** [Book catalog management - Collection book listing, sorting, and type filtering](./sub-use-cases/SUC-001-04-collection-book-listing-sorting-and-filtering.md) *(1 test(s))* 
  - **[SUC-001-05]** [Book catalog management - Global case- and accent-insensitive search across all collections](./sub-use-cases/SUC-001-05-global-full-text-catalog-search.md) *(2 test(s))* 
  - **[SUC-001-06]** [Book catalog management - Catalog data persistence across application restarts](./sub-use-cases/SUC-001-06-catalog-data-persistence.md) *(1 test(s))* 
  - **[SUC-001-07]** [Book catalog management - Atomic bulk book move across collections](./sub-use-cases/SUC-001-07-bulk-move-books-across-collections.md) *(2 test(s))* 
  - **[SUC-001-08]** [Book catalog management - Atomic bulk metadata and series update with automatic volume extraction](./sub-use-cases/SUC-001-08-bulk-update-books-with-volume-extraction.md) *(3 test(s))* 

### [UC-002] Book series and missing volumes management
- **File**: [`use-cases/UC-002-book-series-and-missing-volumes.md`](./use-cases/UC-002-book-series-and-missing-volumes.md)
- **Type of requirement**: `Functional` | **Priority**: `Highest` | **Status**: `Prêt`
- **Sub Use Cases (`>>> relates to`)**:
  - **[SUC-002-01]** [Book series and missing volumes management - Case- and accent-insensitive series grouping and volume sorting](./sub-use-cases/SUC-002-01-group-books-by-normalized-series-and-volume.md) *(1 test(s))* 
  - **[SUC-002-02]** [Book series and missing volumes management - Automatic missing volumes calculation in series numbering](./sub-use-cases/SUC-002-02-automatic-missing-volumes-calculation.md) *(2 test(s))* 
  - **[SUC-002-03]** [Book series and missing volumes management - Latest published volume configuration per series](./sub-use-cases/SUC-002-03-configure-latest-published-volume-count.md) *(2 test(s))* 
  - **[SUC-002-04]** [Book series and missing volumes management - Dedicated series screen, incomplete series filter, and one-click missing volumes copy](./sub-use-cases/SUC-002-04-series-screen-filtering-and-missing-export.md) *(2 test(s))* 

### [UC-003] Duplicate and alternative edition detection
- **File**: [`use-cases/UC-003-duplicate-and-edition-detection.md`](./use-cases/UC-003-duplicate-and-edition-detection.md)
- **Type of requirement**: `Functional` | **Priority**: `Highest` | **Status**: `Prêt`
- **Sub Use Cases (`>>> relates to`)**:
  - **[SUC-003-01]** [Duplicate and alternative edition detection - Exact ISBN-13 duplicate detection and collection attachment](./sub-use-cases/SUC-003-01-exact-isbn13-duplicate-detection.md) *(3 test(s))* 
  - **[SUC-003-02]** [Duplicate and alternative edition detection - Alternative edition detection by matching author and title with different ISBN](./sub-use-cases/SUC-003-02-alternative-edition-detection.md) *(2 test(s))* 
  - **[SUC-003-03]** [Duplicate and alternative edition detection - Case-, accent-, punctuation-, and article-insensitive comparison with distinct volume handling](./sub-use-cases/SUC-003-03-tolerant-title-author-and-volume-comparison.md) *(2 test(s))* 
  - **[SUC-003-04]** [Duplicate and alternative edition detection - Immediate duplicate check feedback during scan and manual entry](./sub-use-cases/SUC-003-04-immediate-duplicate-feedback-in-scan-flow.md) *(2 test(s))* 

### [UC-004] ISBN barcode and cover metadata lookup
- **File**: [`use-cases/UC-004-isbn-barcode-and-cover-metadata-lookup.md`](./use-cases/UC-004-isbn-barcode-and-cover-metadata-lookup.md)
- **Type of requirement**: `Functional` | **Priority**: `Highest` | **Status**: `Prêt`
- **Sub Use Cases (`>>> relates to`)**:
  - **[SUC-004-01]** [ISBN barcode and cover metadata lookup - Camera EAN-13 / ISBN-13 barcode scanning in browser](./sub-use-cases/SUC-004-01-camera-ean13-isbn-barcode-scanning.md) *(2 test(s))* 
  - **[SUC-004-02]** [ISBN barcode and cover metadata lookup - Manual ISBN-10 / ISBN-13 entry, checksum validation, and ISBN-13 normalization](./sub-use-cases/SUC-004-02-manual-isbn10-isbn13-normalization-and-validation.md) *(2 test(s))* 
  - **[SUC-004-03]** [ISBN barcode and cover metadata lookup - Automatic metadata, author roles, series, and volume retrieval by ISBN](./sub-use-cases/SUC-004-03-automatic-bibliographic-and-series-metadata-retrieval.md) *(3 test(s))* 
  - **[SUC-004-04]** [ISBN barcode and cover metadata lookup - Multi-source bibliographic metadata merging (BnF, Google Books, Open Library)](./sub-use-cases/SUC-004-04-multi-source-bibliographic-metadata-merging.md) *(1 test(s))* 
  - **[SUC-004-05]** [ISBN barcode and cover metadata lookup - Continuous sequential scanning workflow with preserved target collection](./sub-use-cases/SUC-004-05-continuous-sequential-barcode-scanning.md) *(1 test(s))* 
  - **[SUC-004-06]** [ISBN barcode and cover metadata lookup - Hybrid local OCR / Vision AI cover analysis and multi-source text search](./sub-use-cases/SUC-004-06-hybrid-ocr-vision-cover-analysis.md) *(4 test(s))* 

### [UC-005] Book cover acquisition and management
- **File**: [`use-cases/UC-005-book-cover-acquisition-and-management.md`](./use-cases/UC-005-book-cover-acquisition-and-management.md)
- **Type of requirement**: `Functional` | **Priority**: `High` | **Status**: `Prêt`
- **Sub Use Cases (`>>> relates to`)**:
  - **[SUC-005-01]** [Book cover acquisition and management - Automatic cover retrieval by ISBN and local storage on book save](./sub-use-cases/SUC-005-01-automatic-cover-retrieval-and-local-storage.md) *(2 test(s))* 
  - **[SUC-005-02]** [Book cover acquisition and management - Cover addition or replacement from a local image file](./sub-use-cases/SUC-005-02-cover-upload-from-image-file.md) *(1 test(s))* 
  - **[SUC-005-03]** [Book cover acquisition and management - Direct camera cover photo capture and interactive cropping](./sub-use-cases/SUC-005-03-camera-cover-capture-and-cropping.md) *(1 test(s))* 
  - **[SUC-005-04]** [Book cover acquisition and management - Cover thumbnail display in catalog and cover removal](./sub-use-cases/SUC-005-04-cover-thumbnail-display-and-removal.md) *(2 test(s))* 
  - **[SUC-005-05]** [Book cover acquisition and management - Book identification from captured cover photo with candidate switching](./sub-use-cases/SUC-005-05-book-identification-from-cover-photo.md) *(2 test(s))* 

### [UC-006] Physical collection and location management
- **File**: [`use-cases/UC-006-physical-collection-and-location-management.md`](./use-cases/UC-006-physical-collection-and-location-management.md)
- **Type of requirement**: `Functional` | **Priority**: `High` | **Status**: `Prêt`
- **Sub Use Cases (`>>> relates to`)**:
  - **[SUC-006-01]** [Physical collection and location management - Collection creation with mandatory name and optional location](./sub-use-cases/SUC-006-01-create-collection-with-name-and-location.md) *(2 test(s))* 
  - **[SUC-006-02]** [Physical collection and location management - Case-insensitive uniqueness of collection name and location pair](./sub-use-cases/SUC-006-02-collection-name-and-location-uniqueness.md) *(1 test(s))* 
  - **[SUC-006-03]** [Physical collection and location management - Collection renaming, location update, and orphan-safe deletion](./sub-use-cases/SUC-006-03-edit-and-safe-delete-collection.md) *(3 test(s))* 
  - **[SUC-006-04]** [Physical collection and location management - Collections list overview with location and book count](./sub-use-cases/SUC-006-04-collections-overview-with-book-counts.md) *(1 test(s))* 

### [UC-007] Daily automated backup and full restoration
- **File**: [`use-cases/UC-007-daily-backup-and-full-restoration.md`](./use-cases/UC-007-daily-backup-and-full-restoration.md)
- **Type of requirement**: `Functional` | **Priority**: `Highest` | **Status**: `Prêt`
- **Sub Use Cases (`>>> relates to`)**:
  - **[SUC-007-01]** [Daily automated backup and full restoration - Automatic daily backup creation or update on book additions or modifications](./sub-use-cases/SUC-007-01-automatic-daily-backup-on-book-mutations.md) *(3 test(s))* 
  - **[SUC-007-02]** [Daily automated backup and full restoration - Rolling retention of the 7 most recent daily backup files](./sub-use-cases/SUC-007-02-rolling-7-day-backup-retention.md) *(1 test(s))* 
  - **[SUC-007-03]** [Daily automated backup and full restoration - Self-contained backup bundle including books, series, covers, users, and settings](./sub-use-cases/SUC-007-03-self-contained-backup-bundle-content.md) *(1 test(s))* 
  - **[SUC-007-04]** [Daily automated backup and full restoration - Backup listing, manual on-demand backup creation, and file download](./sub-use-cases/SUC-007-04-list-create-and-download-backups.md) *(2 test(s))* 
  - **[SUC-007-05]** [Daily automated backup and full restoration - Transactional full restoration from server backup or uploaded backup file](./sub-use-cases/SUC-007-05-restore-library-from-server-or-uploaded-file.md) *(3 test(s))* 

### [UC-008] User authentication, permissions, and deployment
- **File**: [`use-cases/UC-008-user-authentication-permissions-and-deployment.md`](./use-cases/UC-008-user-authentication-permissions-and-deployment.md)
- **Type of requirement**: `Functional` | **Priority**: `Highest` | **Status**: `Prêt`
- **Sub Use Cases (`>>> relates to`)**:
  - **[SUC-008-01]** [User authentication, permissions, and deployment - Mandatory username and password authentication for application and API access](./sub-use-cases/SUC-008-01-mandatory-authentication-for-app-and-api.md) *(2 test(s))* 
  - **[SUC-008-02]** [User authentication, permissions, and deployment - Default initial administrator account provisioning on empty database](./sub-use-cases/SUC-008-02-default-initial-administrator-provisioning.md) *(1 test(s))* 
  - **[SUC-008-03]** [User authentication, permissions, and deployment - Granular role-based access control on book addition, modification, and deletion](./sub-use-cases/SUC-008-03-granular-role-based-book-permissions.md) *(2 test(s))* 
  - **[SUC-008-04]** [User authentication, permissions, and deployment - User account and permission management with last-administrator protection](./sub-use-cases/SUC-008-04-user-account-management-and-last-admin-protection.md) *(2 test(s))* 
  - **[SUC-008-05]** [User authentication, permissions, and deployment - Responsive smartphone/tablet/desktop web UI and compact single-line navigation bar](./sub-use-cases/SUC-008-05-responsive-ui-and-compact-single-line-navigation.md) *(2 test(s))* 
  - **[SUC-008-06]** [User authentication, permissions, and deployment - Progressive Web App installability and Owl & Book vector visual identity](./sub-use-cases/SUC-008-06-pwa-installability-and-owl-book-emblem.md) *(2 test(s))* 
  - **[SUC-008-07]** [User authentication, permissions, and deployment - Docker Compose deployment, persistent volume, HTTPS camera access, and Nginx reverse proxy support](./sub-use-cases/SUC-008-07-docker-persistent-volume-and-nginx-reverse-proxy.md) *(2 test(s))* 

