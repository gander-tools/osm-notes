# Technology Stack

OSM Notes technology stack with versions and implementation details.

## Runtime & Package Management

- **Node.js**: ≥22.12.0 (LTS)
- **Package Manager**: Bun ≥1.3.0 (preferred over npm/yarn)
- **Environment**: Modern ES2020+ JavaScript runtime

## Frontend Framework

- **Framework**: Vue 3+ (Composition API + `<script setup>`)
- **Language**: TypeScript 5 (strict mode)
- **Build Tool**: Vite 7+ (fast development and optimized builds)
- **Bundler**: Rollup (via Vite)

## Styling & UI

- **CSS Framework**: TailwindCSS v4 with utility classes
- **Component Variants**: class-variance-authority (CVA)
- **Utility Helpers**:
  - tailwind-merge (conditional classes)
  - clsx (conditional className logic)
- **Icons**: Lucide Vue Next (consistent icon library)

## State Management & Routing

- **State Management**: Pinia stores with setup syntax
- **Routing**: Vue Router 4 with lazy loading
- **State Architecture**: Domain-specific stores (not single large store)
- **Route Features**: Guards, meta fields for auth/permissions

## Authentication & Security

- **OAuth 2.0 Flow**: Authorization Code flow with PKCE (Proof Key for Code Exchange)
- **Client Type**: Public client (no client secret required)
- **Library**: osm-auth v3+ for OpenStreetMap OAuth implementation
- **Security Standard**: PKCE replaces deprecated OAuth 2.0 Implicit Flow
- **Token Storage**: localStorage or sessionStorage (OSM tokens don't expire automatically)
- **Required Scopes**: `read_prefs`, `write_prefs`, `write_api`
- **Security Features**: CSRF protection, code challenge/verifier, state parameter

## Testing Infrastructure

- **Unit Testing**: Vitest 3+ with jsdom environment
- **Component Testing**: @vue/test-utils
- **E2E Testing**: Playwright (Chromium, Firefox, WebKit)
- **Testing Environment**: jsdom for DOM testing
- **Test Methodology**: Test-Driven Development (TDD) - RED → GREEN → REFACTOR

## Code Quality & Development Tools

- **Formatter/Linter**: Biome.js (formatting + linting)
- **Git Hooks**: Lefthook 2+ for automated quality checks
- **Type Checking**: vue-tsc with strict TypeScript
- **Path Mapping**: `@/*` → `./src/*` (via tsconfig.json)

## Future Backend (Planned)

- **Database**: SurrealDB 2.3+ (self-hosted)
- **Deployment**: Docker Compose on VPS
- **Encryption**: Web Crypto API (client-side only)
  - PBKDF2-HMAC-SHA256 for key derivation
  - AES-256-GCM for data encryption
- **Architecture**: Zero-knowledge (server never accesses plaintext)

## External APIs

- **OpenStreetMap API**: v0.6 for changeset management
- **Overpass API**: Query OSM objects by location/ID
- **Nominatim API**: Geocoding and reverse geocoding
- **OpenAI API**: Whisper (transcription) + GPT-4 Vision (OCR)

## Development Environment

- **Browser Support**: Chrome 110+, Firefox 110+, Safari 16.4+, Edge 110+
- **Mobile Support**: Chrome Android 110+, Mobile Safari 16.4+
- **Development Browser**: Chrome/Edge/Brave with Vue devtools recommended
- **Custom Formatters**: Enabled for better Vue debugging

## Dependencies Overview

### Core Dependencies
- **vue**: ^3.5.22
- **vue-router**: ^4.6.3
- **pinia**: ^3.0.3
- **osm-auth**: ^3.0.0
- **@vueuse/core**: ^14.0.0

### Styling Dependencies
- **tailwindcss**: ^4.1.17
- **@tailwindcss/vite**: ^4.1.17
- **tailwind-merge**: ^3.4.0
- **class-variance-authority**: ^0.7.1
- **clsx**: ^2.1.1

### Development Dependencies
- **typescript**: ~5.9.0
- **vite**: ^7.1.11
- **vitest**: ^3.2.4
- **@playwright/test**: ^1.56.1
- **@biomejs/biome**: ^2.3.5
- **vue-tsc**: ^2.3.2

## Configuration Files

- **vite.config.ts**: Vite build config with Vue plugin, TailwindCSS, devtools
- **vitest.config.ts**: Test config with jsdom environment, excludes e2e tests
- **playwright.config.ts**: E2E config for Chromium/Firefox/WebKit, dev server integration
- **biome.json**: Formatting (tabs, double quotes) and linting rules
- **tsconfig.json**: TypeScript config with path mapping
- **lefthook.yml**: Git hooks for automated quality checks
- **.nvmrc**: Node.js version specification (22.12.0)

## Development Patterns

### Component Development
- Use Composition API with `<script setup>` syntax
- TypeScript for all component logic
- Props validation with TypeScript interfaces
- Emit events with proper typing

### State Management
- Create domain-specific Pinia stores instead of single large store
- Use setup syntax for better TypeScript inference
- Implement getters for derived state
- Leverage storeToRefs for reactive property extraction

### Authentication Implementation
- **PKCE Parameters**:
  - Generate code_verifier: 128 random bytes, base64url encoded
  - Generate code_challenge: SHA-256 hash of code_verifier, base64url encoded
  - Use code_challenge_method=S256
- **Authorization Flow**:
  - Include state parameter for CSRF protection
  - Verify state parameter on callback
  - Exchange authorization code + code_verifier for access_token
- **Token Management**:
  - Store access_token in localStorage/sessionStorage for persistence
  - Include Authorization: Bearer {token} header for OSM API requests
  - Handle 401 Unauthorized errors by triggering re-authorization
- **Error Handling**:
  - Implement exponential backoff for rate limits
  - Provide user-friendly error messages for OAuth failures
  - Test OAuth flow extensively on mobile browsers

### Testing Strategy
- Unit tests with Vitest for individual components and functions
- E2E tests with Playwright for user workflows
- jsdom environment for DOM testing
- TDD methodology: Write tests first, then implementation

### Code Quality
- Biome for consistent formatting and linting
- Strict TypeScript configuration
- Lefthook git hooks for pre-commit quality checks
- Path mapping for clean imports

## Browser Requirements

### Development
- **Recommended**: Chrome, Edge, Brave with Vue devtools extension
- **Required Extensions**:
  - Vue.js devtools for component inspection
  - Custom object formatters enabled for debugging

### Testing
- **Primary**: Chromium (via Playwright)
- **Secondary**: Firefox, WebKit for compatibility
- **Mobile**: Chrome Android, Mobile Safari testing

### Production (Target)
- Modern browsers with ES2020+ support
- WebCrypto API for client-side encryption
- Local Storage for encrypted data persistence
- Web Audio API and Camera API for mobile functionality