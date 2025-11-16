# OSM Notes

> Zero-Knowledge Field Data Collection for OpenStreetMap

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/node-%E2%89%A522.12.0-brightgreen)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/bun-%E2%89%A51.3.0-orange)](https://bun.sh/)
[![Development Status](https://img.shields.io/badge/status-early%20development-yellow)](https://github.com/gander-tools/osm-notes)

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)
- [Documentation](#documentation)

## Project Description

OSM Notes is a web application enabling advanced OpenStreetMap mappers to collect, aggregate, and process field data while maintaining full privacy through zero-knowledge encryption.

### The Problem

Existing OSM editors (iD Editor, JOSM) do not offer a convenient solution for collecting and organizing field notes on mobile devices while maintaining data privacy before publication on the map. Advanced mappers need a tool that:

- Works on mobile devices (current OSM editors are desktop-only)
- Aggregates data from various sources (audio, images, text, location)
- Processes raw data into OSM tags with AI assistance
- Maintains full control over data before publication
- Does not require trust in the server operator

### The Solution

A modern web application combining:

- **Privacy-First**: Zero-knowledge architecture with client-side encryption (PBKDF2 + AES-256-GCM)
- **Mobile-Friendly**: Responsive UI optimized for field work on smartphones
- **AI-Assisted**: Optional integration with OpenAI API for audio transcription and image OCR
- **OSM Integration**: Direct changeset commits via OAuth 2.0 with PKCE, tag validation through id-tagging-schema
- **Open-Source**: Full code transparency with self-hosting capability

### Key Features

- 🔒 **Encrypted Account**: Single password protecting all notes with zero-knowledge encryption
- 🗺️ **OSM OAuth 2.0 Integration**: Secure Authorization Code flow with PKCE for direct changeset commits
- 📝 **Multi-Modal Data Collection**: Text notes, voice recordings, photos with location
- 🤖 **AI Processing**: OpenAI Whisper transcription and GPT-4 Vision OCR
- 🏷️ **Smart Tagging**: AI-powered OSM tag suggestions with confidence scores
- ✅ **Tag Validation**: Compliance checking via @openstreetmap/id-tagging-schema
- 👀 **Diff Preview**: Review changes before committing to OSM
- 📤 **Data Export**: Complete backup functionality for user data

## Tech Stack

### Runtime & Build
- **Node.js**: ≥22.12.0
- **Package Manager**: Bun ≥1.3.0
- **Build Tool**: Vite 7+
- **Language**: TypeScript 5 (strict mode)

### Frontend Framework
- **Framework**: Vue 3+ (Composition API + `<script setup>`)
- **Routing**: Vue Router 4 with lazy loading
- **State Management**: Pinia stores with setup syntax
- **Utilities**: VueUse Core for composition utilities

### Styling
- **CSS Framework**: TailwindCSS v4 with utility classes
- **Component Variants**: class-variance-authority (CVA)
- **Utility Helpers**: tailwind-merge, clsx
- **Icons**: Lucide Vue Next

### Testing
- **Unit Testing**: Vitest 3+ with jsdom environment
- **Component Testing**: @vue/test-utils
- **E2E Testing**: Playwright (Chromium, Firefox, WebKit)
- **Test-Driven Development**: Mandatory RED → GREEN → REFACTOR workflow

### Code Quality
- **Formatter/Linter**: Biome.js (formatting + linting)
- **Git Hooks**: Lefthook 2+ for automated quality checks
- **Type Checking**: vue-tsc with strict TypeScript

### Authentication & Security
- **OAuth 2.0**: Authorization Code flow with PKCE (modern security standard)
- **OAuth Library**: osm-auth v3+ for OpenStreetMap integration
- **Client Type**: Public client mode (no client secret required)
- **Token Storage**: localStorage/sessionStorage (OSM tokens don't expire automatically)
- **Security Features**: CSRF protection, code challenge/verifier, state parameter

### Future Backend
- **Database**: SurrealDB 2.3+ (self-hosted)
- **Deployment**: Docker Compose on VPS
- **Encryption**: Web Crypto API (client-side only)
- **Authentication**: OSM OAuth 2.0 Authorization Code flow with PKCE (osm-auth v3+), PBKDF2 password derivation

### External APIs
- **OpenStreetMap API**: v0.6 for changeset management
- **Overpass API**: OSM object queries by location/ID
- **Nominatim API**: Geocoding and reverse geocoding
- **OpenAI API**: Whisper (transcription) + GPT-4 Vision (OCR)

## Getting Started Locally

### Prerequisites

- **Node.js**: ≥22.12.0 ([Download](https://nodejs.org/))
- **Bun**: ≥1.3.0 ([Install Guide](https://bun.sh/docs/installation))
- **Modern Browser**: Chrome 110+, Firefox 110+, Safari 16.4+, or Edge 110+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd osm-notes
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun dev
   ```

   The application will be available at `http://localhost:5173`

### Browser Setup (Recommended)

**Chrome/Edge/Brave:**
- Install [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Enable Custom Object Formatters](http://bit.ly/object-formatters) for better Vue debugging

**Firefox:**
- Install [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
- [Enable Custom Object Formatters](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

### First-Time E2E Testing Setup

```bash
npx playwright install
```

## Available Scripts

### Development
```bash
bun dev                        # Start development server with hot reload (localhost:5173)
bun preview                    # Preview production build (localhost:4173)
```

### Build & Type Checking
```bash
bun run build                  # Full production build (type-check + build)
bun run build-only             # Build without type checking
bun run type-check             # Type check only with vue-tsc
```

### Code Quality
```bash
bun run check                  # Run all Biome checks (format + lint)
bun run check:fix              # Auto-fix all Biome issues
bun run check:format           # Check formatting only
bun run check:format:fix       # Fix formatting issues
bun run check:lint             # Check linting only
bun run check:lint:fix         # Fix linting issues
```

### Testing
```bash
# Unit Tests
bun test:unit                  # Run Vitest unit tests in watch mode
bun test:unit --run            # Run unit tests once
bun test:unit --coverage       # Run with coverage report

# E2E Tests (requires build first)
bun test:e2e                   # Run Playwright e2e tests
bun test:e2e --debug           # Run e2e tests in debug mode
bun test:e2e --project=chromium # Run e2e tests on specific browser
```

### Single Test Execution
```bash
# Specific test files
bun test:unit tests/unit/App.spec.ts         # Run specific unit test file
bun test:e2e e2e/homepage.spec.ts            # Run specific e2e test file

# Test by name pattern
bun test:unit -t "counter test name"         # Run specific test by name
```

## Project Scope

### Target Users

**Primary Persona: Advanced OSM Mapper**
- **Experience**: 3+ years with OpenStreetMap, 5000+ changesets
- **Technical Knowledge**: Advanced (understands API keys, encryption, OAuth)
- **Devices**: Smartphone (Android/iOS) + laptop for data processing
- **Use Cases**: Field mapping walks, POI documentation, opening hours collection

### Use Cases

- **Mobile Field Data Collection**: Record observations while walking/surveying
- **Multi-Modal Notes**: Combine text, voice, photos, and location data
- **AI-Assisted Processing**: Convert audio to text, extract text from images
- **Smart Tagging**: Get AI suggestions for appropriate OSM tags
- **Quality Control**: Validate tags against official OSM schema
- **Direct Publishing**: Commit changesets directly to OpenStreetMap

### Success Metrics (MVP)

| Metric | Target | Purpose |
|--------|---------|---------|
| Active Beta Testers | ≥1 user finding solution promising | Validate product-market fit |
| Objects Committed to OSM | ≥20 per user/month | Measure actual utility |
| Changeset Success Rate | >90% | Ensure data quality |
| Time: Collection → Commit | <5 minutes average | Validate efficiency |
| Security Incidents | 0 data leaks/breaches | Privacy-first validation |
| Onboarding Completion | >70% | Usability validation |

### Out of Scope (MVP)

- Multi-user collaboration
- PWA offline support
- Mobile native apps
- Desktop application
- Social features or gamification

## Project Status

🚧 **Early Development** (v0.0.0)

The project is currently in the foundation phase with the following progress:

### ✅ Completed Infrastructure
- Project scaffolding and build configuration
- Development environment setup (Node.js 22+, Bun 1.3+, Vite 7+)
- Testing infrastructure (Vitest + Playwright)
- Code quality tools (Biome, Lefthook 2+)
- Comprehensive documentation and TDD methodology

### 📋 Development Roadmap

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| **Phase 1: Foundation** | Dec 2025 - Jan 2026 | Authentication + Basic UI + Map Integration |
| **Phase 2: Data Collection** | Feb 2026 | Text/Audio/Image capture + Encryption |
| **Phase 3: AI Integration** | Mar 2026 | OpenAI transcription + OCR + Tag suggestions |
| **Phase 4: OSM Integration** | Apr 2026 | Tag validation + Changeset commits |
| **Phase 5: Polish & Testing** | May 2026 | Full test coverage + Security audit |
| **Phase 6: Beta Testing** | Jun-Jul 2026 | Closed beta with OSM mappers |
| **Phase 7: Public Release** | Aug 2026 | v1.0.0 production launch |

### 🔮 Long-Term Goals (v2.0+)
- **v1.1**: PWA with offline support
- **v2.0**: Multi-user collaboration, 100+ active users
- **v2.5**: Mobile native apps

### 📊 Development Resources
- **Team**: 1 developer (solo project)
- **Timeline**: ~400 hours over 8 months
- **Budget**: ~$20/month (VPS + domain)

## License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

### GPL-3.0 Summary

- ✅ **Commercial use allowed**
- ✅ **Modification and distribution permitted**
- ✅ **Patent use allowed**
- ❗ **Source code must be disclosed**
- ❗ **License and copyright notice required**
- ❗ **Derivatives must use same license**

### Compliance Requirements

- **OSM Attribution**: Required link to OpenStreetMap in footer
- **Open Source**: Full code transparency and self-hosting capability
- **User Responsibility**: Users must comply with OpenAI API Terms of Service

## Documentation

- 📋 **[Development Guidelines](CLAUDE.md)** - Complete development setup, architecture, and coding standards
- 📄 **[Product Requirements](/.claude/prd.md)** - Detailed product vision, technical specifications, and roadmap
- ⚙️ **[Git Hooks Configuration](lefthook.yml)** - Automated code quality and testing setup
- 📝 **[Contributing Guidelines](CONTRIBUTING.md)** - Contribution process and standards *(Coming Soon)*

---

**Note**: This is an open-source project focused on privacy and security for the OpenStreetMap community. The zero-knowledge architecture ensures that only you can access your data, even with physical server access.