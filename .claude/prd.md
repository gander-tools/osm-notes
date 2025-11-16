# Product Requirements Document (PRD)
## OSM Notes - Zero-Knowledge Field Data Collection for OpenStreetMap

**Document Version:** 1.0  
**Date:** November 15, 2025  
**Status:** Draft  
**Author:** Product Manager  
**Stakeholders:** Developer (owner), Beta testers (advanced OSM mappers)

---

## Executive Summary

### Product Vision
OSM Notes is a web application enabling advanced OpenStreetMap mappers to collect, aggregate, and process field data while maintaining full privacy through zero-knowledge encryption.

### Problem
Existing OSM editors (iD Editor, JOSM) do not offer a convenient solution for collecting and organizing field notes on mobile devices while maintaining data privacy before publication on the map.

Users need a tool that:
- Works on mobile devices (OSM editors are desktop-only)
- Aggregates data from various sources (audio, images, text, location)
- Processes raw data into OSM tags
- Does not require trust in the server operator
- Maintains control over data before publication

### Solution
A web application combining:
- Client-side encryption (PBKDF2 + AES) for all user data
- Integration with OpenAI API for audio transcription and image OCR
- OSM tag validation through @openstreetmap/id-tagging-schema
- OSM OAuth for direct changeset commits
- SurrealDB as backend storage with full client-side encryption

### Key Values
- **Privacy-first:** Zero-knowledge architecture - operator has no access to decrypted data
- **Mobile-friendly:** Responsive UI adapted for field work
- **AI-assisted:** Optional AI usage for processing raw data
- **Open-source:** Full code transparency and self-hosting capability

---

## Project Specifications

### Stakeholders

| Role | Person/Group | Responsibility |
|------|-------------|-----------------|
| Product Owner | Developer (self) | Development, deployment, maintenance |
| Beta Testers | 5-10 advanced OSM mappers | Feedback, bug reports, feature requests |
| End Users | Advanced OSM contributors | Application usage in production |
| Technical Reviewer | OSM Community | Code review, security audit |

### Timeline

| Milestone | Target Date | Status |
|-----------|------------|--------|
| MVP Development Start | December 2025 | Planned |
| Internal Alpha | January 2026 | Planned |
| Closed Beta | February 2026 | Planned |
| Public Beta | May 2026 | Planned |
| v1.0 Production | August 2026 | Planned |

### Budget & Resources
- **Development:** 1 developer (self), ~400h over 8 months
- **Infrastructure:** ~$20/month (VPS for SurrealDB, domain)
- **Third-party costs:** $0 (users provide own OpenAI API keys)

---

## Goals & Success Metrics

### MVP Goals
1. Enable collection and organization of field notes with full encryption
2. Integrate basic data sources: text, audio, images, location
3. Implement OSM tag validation compliant with id-tagging-schema
4. Enable direct changeset commits to OSM API

### Success Metrics (KPIs)

| Metric | Target MVP | Measurement Method |
|--------|------------|-------------------|
| Active Beta Testers | ≥1 considering solution promising | GitHub Discussions feedback |
| Objects Committed to OSM | ≥20 per user/month | OSM API logs (anonymous) |
| Changeset Success Rate | >90% | Failed vs successful commits ratio |
| Time from Data Collection to Commit | <5 min average | User flow analytics (opt-in) |
| Zero Security Incidents | 0 data leaks/breaches | Sentry logs, security audits |
| Onboarding Completion Rate | >70% | Analytics (opt-in via Medama) |

### Long-term Goals (v2.0+)
- PWA with offline support (v1.1)
- Multi-user collaboration (v2.0)
- Mobile native apps (v2.5)
- 100+ active monthly users (v2.0)

---

## User Personas & Stories

### Primary Persona: Advanced OSM Mapper

**Profile:**
- **Name:** Kamil, 35 years old
- **OSM Experience:** 3+ years, 5000+ changesets
- **Technical Knowledge:** Advanced (understands API keys, encryption, OAuth)
- **Devices:** Smartphone (Android/iOS) + laptop
- **Use case:** Mapping during walks, documenting POI (shops, opening hours, payment methods)
- **Pain points:** Desktop-only OSM editors, lack of tools for organizing field notes, concern about data privacy before publication

### User Stories (MVP)

#### Must Have (M)
1. As a mapper I want to create an encrypted account with a single password so I can protect my notes from unauthorized access
2. As a mapper I want to authorize via OSM OAuth so I can commit changesets directly from the app
3. As a mapper I want to add a text note linked to a location so I can document field observations
4. As a mapper I want to record a voice note and transcribe it via OpenAI API so I can quickly save information in the field
5. As a mapper I want to take a photo of a sign/opening hours and extract text via OCR so I can avoid manual transcription
6. As a mapper I want to select an OSM object on the map and fetch its existing tags so I can update the data
7. As a mapper I want to receive OSM tag suggestions based on collected data so I can tag the object correctly
8. As a mapper I want to validate tags before commit via id-tagging-schema so I can avoid errors
9. As a mapper I want to review the diff before sending the changeset so I can control what is published
10. As a mapper I want to export all my data so I can have a backup in case of server failure

#### Should Have (S)
11. As a mapper I want to filter notes by status/date/location so I can quickly find unprocessed data
12. As a mapper I want batch processing of multiple audio note transcriptions so I can optimize API costs
13. As a mapper I want to search for an address via Nominatim API so I can quickly locate an object
14. As a mapper I want to see confidence scores for suggested tags so I can evaluate AI suggestion quality

#### Could Have (C)
15. As a mapper I want to use the app without an OpenAI API key so I can use basic features offline
16. As a paranoid user I want to self-host SurrealDB so I have full control over infrastructure

#### Won't Have (MVP)
17. Multi-user collaboration
18. PWA offline support
19. Tile caching
20. Mobile native apps

---

## Functional Requirements

### 1. Authentication & Authorization

#### 1.1 User Registration (M)
- Multi-step onboarding wizard (6 steps)
- Main password creation: min 12 characters, strength meter, double confirmation
- Mandatory checkbox: "I understand that losing my password = permanent data loss"
- PBKDF2-HMAC-SHA256: 310,000 iterations, salt 64 bytes
- Encryption key generation from password for SurrealDB

#### 1.2 OSM OAuth Integration (M)
- **OAuth 2.0 Authorization Code flow with PKCE** (public client mode)
- **Library**: osm-auth v3+ for implementation
- **Security**: PKCE (Proof Key for Code Exchange) replaces deprecated Implicit Flow
- **Client Type**: Public client (no client secret required)
- **PKCE Implementation**:
  - Generate code_verifier (128 random bytes, base64url encoded)
  - Generate code_challenge (SHA-256 hash of code_verifier, base64url encoded)
  - Use code_challenge_method=S256
- **Authorization Request Parameters**:
  - client_id: Public OAuth client ID for OSM Notes
  - redirect_uri: Web application callback URL
  - scope: `read_prefs`, `write_prefs`, `write_api`
  - state: CSRF protection parameter (random string)
  - code_challenge + code_challenge_method=S256
- **Token Exchange**: Authorization code + code_verifier → access_token
- **Token Storage**: localStorage or sessionStorage (OSM tokens don't expire automatically)
- **Scope Explanations** in UI before authorization:
  - `read_prefs`: Read user profile information
  - `write_prefs`: Update user profile settings
  - `write_api`: Create/modify OSM objects via changesets
- **Data Storage**:
  - OSM user ID in User table (unencrypted)
  - Access token in localStorage/sessionStorage (client-side only, never sent to SurrealDB)

#### 1.3 OpenAI API Key Management (S)
- Optional input during onboarding (skippable)
- Storage in SurrealDB encrypted with user encryption key
- Alternative: sessionStorage (requires re-entry each session)
- Key validation via test API call before saving

#### 1.4 Session Management (M)
- Password entered only at login
- Encryption key held in memory during session (not in localStorage)
- Auto-logout after 24h inactivity or browser close
- Re-authentication for sensitive operations (commit changeset, export data)

### 2. Data Collection

#### 2.1 Text Notes (M)
- Free-form text input with Markdown support
- Automatic timestamp creation
- Optional title field
- Rich text editor (TipTap or Quill)

#### 2.2 Audio Recording (M)
- Web Audio API for recording in browser
- Supported formats: WebM, Ogg (browser-dependent)
- Max duration: 5 minutes per recording
- Visual waveform display during recording
- Local storage as encrypted blob in IndexedDB
- On-demand transcription button per note
- Progress indicator for transcription (estimated time based on audio length)
- Preserve original + transcription as separate fields in Data table

#### 2.3 Image Capture & OCR (M)
- Camera API or file upload
- Supported formats: JPEG, PNG, WebP
- Max file size: 10MB per image
- Client-side compression before encryption (quality: 85%)
- OCR via OpenAI Vision API
- Preview thumbnail in note detail view
- Storage of encrypted blob in IndexedDB + reference in SurrealDB

#### 2.4 Location Selection (M)
Three methods for location selection:
1. Map picker: Leaflet with OSM tiles, click to select coordinates
2. OSM object search: Input OSM ID (node/way/relation) → fetch via Overpass API
3. Address search: Nominatim API with autocomplete, rate limit 1 req/s, 1000ms debounce

#### 2.5 Existing OSM Data Import (M)
- Fetch existing tags for selected object via OSM API
- Display as read-only fields in note detail view
- Diff comparison: existing tags vs suggested new tags
- Visual highlighting of changes (red=removed, green=added, yellow=modified)

### 3. Data Processing

#### 3.1 AI Aggregation Pipeline (S)
Workflow for each note:
1. Collect raw data: audio transcription, OCR text, user text notes, address, existing OSM tags
2. Optional AI prompt: "Based on the following notes, suggest appropriate OSM tags compliant with id-tagging-schema: [raw data]"
3. Parse AI response → JSON with suggested tags + confidence scores
4. Storage in NoteToOSMObject.suggested_tags

#### 3.2 Tag Validation (M)
- @openstreetmap/id-tagging-schema: automatic validation before presenting suggestions
- @ideditor/schema-builder: validation before commit
- Warning levels: error (blocking), warning (non-blocking), info
- Display validation messages in UI with links to OSM Wiki

#### 3.3 User Review & Acceptance (M)
- Checkbox list with all suggested tags
- Source indicator for each tag (AI, user input, existing OSM)
- Confidence score bar (0-100%) for AI suggestions
- Manual edit capability for each tag
- "Accept all" / "Reject all" bulk actions

### 4. Data Storage & Sync

#### 4.1 Database Schema (SurrealDB)

```sql
-- User account
DEFINE TABLE User SCHEMAFULL;
DEFINE FIELD osm_id ON User TYPE string;
DEFINE FIELD pass_hash ON User TYPE string; -- PBKDF2 hash
DEFINE FIELD created_at ON User TYPE datetime;
DEFINE FIELD last_login_at ON User TYPE datetime;

-- Note container (encrypted content)
DEFINE TABLE Note SCHEMAFULL;
DEFINE FIELD user_id ON Note TYPE record(User);
DEFINE FIELD encrypted_content ON Note TYPE string; -- JSON: {osm_object_id, location, title}
DEFINE FIELD created_at ON Note TYPE datetime;
DEFINE FIELD updated_at ON Note TYPE datetime;

-- Data fragment (encrypted content)
DEFINE TABLE Data SCHEMAFULL;
DEFINE FIELD note_id ON Data TYPE record(Note);
DEFINE FIELD encrypted_content ON Data TYPE string; -- JSON: {type, content, status}
DEFINE FIELD created_at ON Data TYPE datetime;
DEFINE FIELD updated_at ON Data TYPE datetime;
```

#### 4.2 Encryption Strategy (M)
- Client-side only: All encryption/decryption operations in browser
- Algorithm: AES-256-GCM
- Key derivation: PBKDF2 from user password
- Encrypted fields: Note.encrypted_content, Data.encrypted_content
- Unencrypted metadata: timestamps, user_id, note_id (for query performance)
- No server-side decryption: SurrealDB never has access to plaintext

#### 4.3 Local Storage (IndexedDB) (M)
- Mirror all User + Note + Data records locally
- Encrypted blobs for audio/images
- Automatic cleanup of data older than 90 days
- Storage quota monitoring (alert at >80% utilization)

#### 4.4 Synchronization (M)
- Trigger: Manual "Sync now" button (MVP), automatic in future
- Model: Last-write-wins with timestamp comparison
- Delta sync: Only records changed since last sync_timestamp
- Conflict handling: Flag conflicting records, manual resolution by user
- Background sync: Service Worker (v1.1 PWA)

### 5. Changeset Management

#### 5.1 Changeset Creation (M)
- Quick commit: Single note → single changeset
- Required fields:
  - comment: min 10 characters, max 255, mandatory
  - created_by: auto-fill "OSM Notes/v1.0.0"
  - source: suggested "survey;local knowledge" (editable)
- OSM API limits: Max 10,000 changes per changeset
- Validation: Pre-commit validation via id-tagging-schema (errors block commit)

#### 5.2 Diff Preview (M)
- Side-by-side comparison: existing tags vs new tags
- Color coding: green (new), yellow (modified), red (removed)
- OSM XML preview in expandable section
- "Edit tags" button for manual corrections before commit

#### 5.3 Commit to OSM (M)
- **Authentication**: Retrieve OAuth access token from localStorage/sessionStorage
- **Authorization Header**: `Authorization: Bearer {access_token}` for all OSM API requests
- **Changeset Creation**: OAuth-authenticated PUT request to OSM API `/api/0.6/changeset/create`
- **Upload Process**:
  1. Validate access token (check if still valid)
  2. Create changeset with required metadata (comment, created_by, source)
  3. Upload changeset XML with object modifications
  4. Close changeset after successful upload
- **Error Handling**:
  - 401 Unauthorized: Token expired/invalid → trigger OAuth re-authorization flow
  - 429 Rate Limited: Exponential backoff with jitter (max 3 attempts)
  - 4xx Client Errors: Display user-friendly error messages
  - 5xx Server Errors: Retry with exponential backoff
- **Success Flow**:
  - Mark note as "committed" in local IndexedDB + SurrealDB
  - Store OSM changeset ID for reference and audit trail
  - Update UI with success confirmation

### 6. User Interface

#### 6.1 Layout (M)

**Desktop (≥1024px):**
- Split view: 40% map (left) + 60% notes list (right)
- Floating toolbar with search/filter controls
- FAB "+" bottom-right for new note

**Mobile (<1024px):**
- Tabbed interface: "Map" | "Notes" | "Changesets"
- Bottom navigation bar
- FAB "+" center-bottom

#### 6.2 Map Component (M)
- Leaflet.js with OSM Carto tiles
- Click to select location → marker placement
- Search bar with Nominatim autocomplete (1 req/s rate limit)
- Zoom controls, geolocation button
- Layer switcher: OSM Standard | Humanitarian | CyclOSM (future)

#### 6.3 Notes List (M)
- Card-based layout with preview: title, timestamp, status badge, location
- Filters: status (draft/processed/committed), date range, location radius
- Sort: newest first, oldest first, nearest (geolocation-based)
- Infinite scroll pagination (20 items per page)
- Empty state: "Add your first note" with tutorial link

#### 6.4 Note Detail View (M)
- Header: title (editable), timestamp, location map thumbnail
- Sections:
  - Raw Data: audio player, image gallery, text notes (editable)
  - Suggested Tags: checkbox list with confidence scores, validation warnings
  - Preview: OSM XML diff
- Actions: "Transcribe", "Validate", "Commit", "Delete", "Export"

#### 6.5 Settings Panel (S)
- Account: OSM username display, last login, logout button
- Security: Change password (re-encrypt all data), export backup, delete account
- API Keys: OpenAI key management (show/hide, test, remove)
- Privacy: Opt-in analytics toggle (default: off), Sentry error reporting toggle (default: off)
- About: App version, link to GitHub repo, Privacy Policy, changelog

### 7. Privacy & Security

#### 7.1 Privacy Policy (M)
Transparent message in UI:
- Cookies: Only essential (session), no tracking → no consent banner needed
- SurrealDB data: "Your data is encrypted client-side. The author has no access to note content but has physical access to the server."
- OpenAI API: "Audio and images sent directly to OpenAI with your API key. Data does not pass through our servers."
- OSM OAuth: "OAuth access tokens stored locally in your browser only. Never sent to our servers. Link to OSM Privacy Policy"
- Token Storage: "OAuth access tokens stored in localStorage/sessionStorage for your convenience. Clear browser data to remove tokens."
- Checkbox: "I confirm that I understand data retention policies" (mandatory at registration)

#### 7.2 Analytics (S)
- Tool: Medama (GDPR-compliant, self-hosted)
- Opt-in: Default off, toggle in Settings
- Collected data: Page views, feature usage counters, browser info, performance metrics
- NOT collected: User content, keystrokes, screenshots, IP addresses
- User ID: Hashed OSM ID (one-way) for grouping events without identification

#### 7.3 Error Monitoring (S)
- Tool: Sentry (self-hosted or cloud with aggressive PII filtering)
- Opt-in: Default off, toggle in Settings
- Filtered data: Passwords, API keys, encrypted content, personal info
- Logged data: Error types, stack traces, browser/OS info, user flow (anonymized)
- User ID: Hashed OSM ID

#### 7.4 Data Backup & Export (M)
- Manual export: "Export all data" button in Settings
- Format: Encrypted JSON bundle with all notes, blobs, config
- Automatic local backup: Daily backup to IndexedDB (opt-in)
- Server-side backup: SurrealDB automated backup every 24h, 30-day retention, encrypted at rest
- Import function: Restore from backup file in Settings

---

## Technical Requirements

### Tech Stack

#### Frontend
- Runtime: Node.js 22+, Bun 1.3+ (package manager)
- Framework: Vue.js 3+ (Composition API)
- Language: TypeScript 5 (strict mode)
- Build tool: Vite 7+
- UI components: shadcn-vue
- Map: Leaflet.js + leaflet.osmdatapicker plugin
- State management: Pinia
- Routing: Vue Router
- Forms: VeeValidate + Zod schemas
- Rich text: TipTap
- Testing: Vitest (unit), Testing Library (integration), Playwright (e2e)
- Code quality: Biome.js (formatting + linting), Lefthook 2+ (git hooks)

#### Backend
- Database: SurrealDB 2.3+ (self-hosted)
- Hosting: Docker Compose on VPS
- Encryption: Web Crypto API (client-side)
  - PBKDF2-HMAC-SHA256 for key derivation
  - AES-256-GCM for data encryption
- Authentication: OSM OAuth 2.0 + PBKDF2 password

#### External APIs
- OpenStreetMap API v0.6: Changeset management, object data
- Overpass API: Query OSM objects by location/ID
- Nominatim API: Geocoding, reverse geocoding (max 1 req/s)
- OpenAI API: Whisper (audio transcription), GPT-4 Vision (OCR)
  - User-provided API key
  - Exponential backoff for 429 rate limit errors

#### Deployment
- Frontend hosting: Cloudflare Pages
- CI/CD: GitHub Actions
  - Workflow: lint → test → build → deploy
  - Playwright tests in CI before each deployment
- Domain: Custom domain with Cloudflare SSL
- Monitoring: Sentry (self-hosted)

### Architecture Diagrams

#### Data Flow
```
User Browser
  ├─ IndexedDB (encrypted local cache)
  ├─ Web Crypto API (encryption/decryption)
  ├─ Vue.js App
  │   ├─ Leaflet Map Component
  │   ├─ Notes Manager
  │   └─ Changeset Creator
  ├─ External APIs
  │   ├─ OSM API (OAuth + changesets)
  │   ├─ Overpass API (object queries)
  │   ├─ Nominatim API (geocoding)
  │   └─ OpenAI API (transcription/OCR, user key)
  └─ SurrealDB (encrypted remote storage)
```

#### Authentication Flow

**SurrealDB Authentication:**
```
1. User enters password
2. PBKDF2 derives encryption key (client-side)
3. Login to SurrealDB with pass_hash
4. Fetch encrypted data from SurrealDB
5. Decrypt in browser with encryption key
6. Store decrypted data in memory (session)
```

**OSM OAuth 2.0 PKCE Flow:**
```
1. User clicks "Connect to OSM" button
2. Generate PKCE parameters (client-side):
   - code_verifier: 128 random bytes, base64url encoded
   - code_challenge: SHA-256 hash of code_verifier, base64url encoded
   - state: Random CSRF protection string
3. Redirect to OSM authorization endpoint:
   - https://www.openstreetmap.org/oauth2/authorize
   - client_id: OSM Notes public client ID
   - redirect_uri: https://osm-notes.app/oauth/callback
   - scope: read_prefs write_prefs write_api
   - response_type: code
   - code_challenge + code_challenge_method=S256
   - state: CSRF token
4. User authorizes on OSM website (enters OSM credentials)
5. OSM redirects back to application with:
   - authorization_code (temporary, expires in 10 minutes)
   - state (for verification)
6. Verify state parameter matches (CSRF protection)
7. Exchange authorization code for access token:
   - POST https://www.openstreetmap.org/oauth2/token
   - grant_type: authorization_code
   - client_id: OSM Notes public client ID
   - code: authorization_code from step 5
   - code_verifier: original verifier from step 2
   - redirect_uri: same as authorization request
8. Receive access_token from OSM (no refresh token, doesn't expire automatically)
9. Store access_token in localStorage/sessionStorage for reuse
10. Use Bearer token for authenticated OSM API requests
```

### Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | <1.5s | Lighthouse |
| Time to Interactive | <3s | Lighthouse |
| Map load time | <2s | Custom metric |
| Encryption operation | <100ms per note | Performance API |
| Decryption operation | <50ms per note | Performance API |
| IndexedDB query | <20ms | Performance API |
| SurrealDB API response | <500ms (p95) | Server metrics |

### Security Requirements

| Requirement | Implementation | Priority |
|-------------|---------------|----------|
| Zero-knowledge encryption | AES-256-GCM, client-side only | M |
| Password strength | Min 12 chars, strength meter | M |
| Key derivation | PBKDF2-HMAC-SHA256, 310k iterations | M |
| Salt randomness | 64 bytes via crypto.getRandomValues | M |
| Session timeout | 24h inactivity or browser close | M |
| HTTPS only | Cloudflare SSL, HSTS headers | M |
| CSP headers | Strict CSP, no inline scripts | M |
| OWASP ZAP scans | Automated in CI | S |
| Dependency audits | npm audit + Dependabot | M |
| Secret rotation | Annual PBKDF2 version bump | C |

### Browser Compatibility

| Browser | Min Version | Notes |
|---------|-------------|-------|
| Chrome | 110+ | Full support |
| Firefox | 110+ | Full support |
| Safari | 16.4+ | Web Audio API limited |
| Edge | 110+ | Full support |
| Mobile Safari | 16.4+ | Camera API, geolocation |
| Chrome Android | 110+ | Camera API, geolocation |

**Polyfills:** None required for target browsers

---

## Non-Functional Requirements

### Scalability
- Users: MVP target: 10-50 concurrent users
- Data volume: Avg 100 notes per user, max 10MB per note (with blobs)
- SurrealDB: Single instance sufficient for MVP, horizontal scaling in future
- Cloudflare Pages: Auto-scaling CDN for frontend

### Reliability
- Uptime: 99% target for MVP (downtime possible during updates)
- Backups: Daily automated SurrealDB backups, 30-day retention
- Data loss: Zero tolerance - mandatory user export feature

### Maintainability
- Code coverage: >80% for new features
- Documentation: README, CONTRIBUTING, API docs, ARCHITECTURE
- Versioning: Semantic versioning (semver)
- Changelog: Keep a changelog format
- Dependencies: Automated updates via Dependabot, manual review before merge

### Usability
- Onboarding: <5 min from landing to first note
- Learning curve: Steep (requires OSM + OpenAI API knowledge)
- Accessibility: WCAG 2.1 AA compliance (future, not MVP)
- i18n: Polish + English in MVP, more languages in future

### Compliance
- GDPR/RODO: Full compliance - zero-knowledge architecture, opt-in analytics, data export
- OSM License: Attribution required, link to OSM in footer
- OpenAI TOS: Users responsible for compliance with their API key

---

## Dependencies & Assumptions

### External Dependencies

| Dependency | Type | Risk Level | Mitigation |
|------------|------|------------|------------|
| OSM API | Critical | Medium | Fallback: manual XML upload |
| Overpass API | Important | Low | Graceful degradation without query |
| Nominatim API | Important | Low | Fallback: manual coordinates |
| OpenAI API | Optional | Low | Feature optional, works without |
| SurrealDB | Critical | Medium | Daily backups, user export |
| Cloudflare Pages | Critical | Low | Alternative: GitHub Pages |

### Assumptions
1. Users have advanced OSM knowledge (understand tagging schema)
2. Users have basic knowledge about API keys and security
3. Most users have access to OpenAI API key ($5-20/month budget)
4. Mobile browsers support Web Audio API + Camera API
5. Users accept the risk of server operator physical access to SurrealDB
6. GitHub remains free for open-source projects
7. OSM API will not introduce breaking changes without deprecation notice

### Constraints
- Budget: Max $30/month (VPS + domain + buffer)
- Development time: ~400h over 8 months (50h/month)
- Team size: 1 developer (solo project)
- Browser requirements: Modern browsers only (no IE11 support)
- Mobile-first: Responsive design mandatory, not native apps in MVP

---

## Out of Scope (MVP)

### Features deferred to future versions

| Feature | Planned Version | Reasoning |
|---------|----------------|-----------|
| PWA offline support | v1.1 | Complexity, Service Worker testing |
| Automatic background sync | v1.1 | Requires PWA |
| Batch changeset commits | v1.2 | Edge case, low demand in MVP |
| GPX/GeoJSON import | v1.2 | Nice-to-have, workaround available |
| Alternative AI providers | v1.3 | OpenAI sufficient for MVP |
| Tile caching offline maps | v1.3 | Storage quota complexity |
| Multi-user collaboration | v2.0 | Requires shared encryption keys architecture |
| CRDT conflict resolution | v2.0 | Over-engineering for single-user MVP |
| Mobile native apps | v2.5 | Web app sufficient, native after successful MVP |
| Recovery key mechanism | Future | Low priority, user education sufficient |
| Photon API alternative | Future | Nominatim sufficient, self-hosting burden |

### Not Planned
- Social features (comments, likes, sharing)
- Gamification (badges, leaderboards)
- Paid subscriptions/premium features
- Desktop Electron app
- Browser extension
- API for third-party integrations

---

## Timeline & Milestones

### Phase 1: Foundation (December 2025 - January 2026)
**Duration:** 8 weeks

- [ ] Project setup: repo, CI/CD, development environment
- [ ] SurrealDB deployment on VPS Docker Compose
- [ ] User authentication: registration, login, OSM OAuth
- [ ] Basic UI layout: desktop + mobile responsive
- [ ] Leaflet map integration with OSM tiles

**Deliverable:** Working application with auth + map

### Phase 2: Data Collection (February 2026)
**Duration:** 4 weeks

- [ ] Text notes CRUD with encryption
- [ ] Audio recording + local storage
- [ ] Image capture + local storage
- [ ] Location picker (map click, OSM ID, address search)
- [ ] IndexedDB persistence

**Deliverable:** Working application for collecting all data types

### Phase 3: AI Integration (March 2026)
**Duration:** 4 weeks

- [ ] OpenAI API key management
- [ ] Whisper transcription integration
- [ ] GPT-4 Vision OCR integration
- [ ] Tag suggestion pipeline
- [ ] Confidence scores calculation

**Deliverable:** Working AI-assisted tag suggestions

### Phase 4: OSM Integration (April 2026)
**Duration:** 4 weeks

- [ ] Overpass API queries for existing objects
- [ ] id-tagging-schema validation
- [ ] Diff preview UI
- [ ] Changeset creation + commit to OSM API
- [ ] Error handling + retry logic

**Deliverable:** End-to-end flow from note to OSM commit

### Phase 5: Polish & Testing (May 2026)
**Duration:** 6 weeks

- [ ] Unit tests (80% coverage)
- [ ] Integration tests (critical paths)
- [ ] E2E tests Playwright (user flows)
- [ ] Security audit + OWASP ZAP scans
- [ ] Performance optimization
- [ ] Documentation (user + dev)
- [ ] Privacy Policy + UI messages

**Deliverable:** Production-ready MVP with tests + docs

### Phase 6: Beta Testing (June - July 2026)
**Duration:** 8 weeks

- [ ] Closed beta with 5-10 OSM mappers
- [ ] Bug fixes from GitHub Issues
- [ ] Feature tweaks based on feedback
- [ ] Stability improvements
- [ ] Final security review

**Deliverable:** Stable beta with positive feedback from at least 1 user

### Phase 7: Public Release (August 2026)
**Duration:** 2 weeks

- [ ] Public announcement on OSM Community Forum
- [ ] GitHub Discussions setup
- [ ] Monitoring + Sentry deployment
- [ ] v1.0.0 release tag
- [ ] Changelog publication

**Deliverable:** Public v1.0.0 production release

---

## Risks & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Browser encryption performance too slow | High | Low | Benchmark in Phase 1, Web Workers if needed |
| IndexedDB quota exceeded | Medium | Medium | Cleanup old data, user warnings, compression |
| OSM API rate limits | Medium | Low | Exponential backoff, user education |
| OpenAI API cost explosion for users | Medium | Medium | Cost calculator in UI, soft limits, warnings |
| SurrealDB breaking changes | High | Low | Pin specific version, migration plan |
| OAuth flow failures on mobile | Medium | Medium | Extensive testing, fallback instructions |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Zero adoption (no beta testers) | High | Medium | Personal network outreach, OSM forum post |
| Negative security audit findings | High | Low | Early security review, bug bounty (future) |
| Infrastructure costs >$30/month | Medium | Low | Usage monitoring, scaling plan, sponsorship |
| Developer burnout (solo project) | High | Medium | Realistic timeline, MVP scope discipline |
| OSM community negative feedback | Medium | Low | Transparent communication, early prototype sharing |

### Legal Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| GDPR violations | High | Low | Zero-knowledge architecture, legal review |
| OpenAI API TOS violations by users | Low | Medium | Clear disclaimers, user responsibility |
| OSM license compliance | Medium | Low | Proper attribution, community guidelines |

### Mitigation Strategies
1. Early testing: Weekly testing in each Phase
2. Community engagement: Monthly updates on OSM forum
3. Documentation: Comprehensive docs from Phase 1
4. Backup plan: User export function priority 1
5. Monitoring: Sentry + analytics from beta launch
6. Scope discipline: Ruthless MoSCoW prioritization

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| Changeset | Atomic group of changes uploaded to OSM database |
| Client-side encryption | Encryption performed in user browser, not on server |
| iD tagging schema | Official OSM tagging validation schema used by iD Editor |
| IndexedDB | Browser-based NoSQL database for local storage |
| Nominatim | OSM geocoding service (address → coordinates) |
| OAuth | Authorization framework for secure API access |
| OCR | Optical Character Recognition (text extraction from images) |
| Overpass API | Read-only OSM query API |
| PBKDF2 | Password-Based Key Derivation Function 2 |
| PKCE | Proof Key for Code Exchange - OAuth 2.0 security extension for public clients using code challenge/verifier |
| Public Client | OAuth 2.0 client type without client secret, uses PKCE for security (e.g., web apps, mobile apps) |
| PWA | Progressive Web App (web app working offline) |
| SurrealDB | Multi-model database with built-in authentication |
| Zero-knowledge | Architecture where server has no access to plaintext user data |

### Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | November 15, 2025 | Product Manager | Initial PRD draft based on 30-question discovery |

---

**Document Approved By:** [Pending]  
**Approval Date:** [Pending]  
**Next Review:** After Phase 1 completion (January 2026)
