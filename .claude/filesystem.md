# Project Filesystem Structure

OSM Notes project directory organization and file structure guidelines.

## Current Project Structure

```
osm-notes/
├── .claude/                    # Claude AI project documentation
│   ├── prd.md                  # Product Requirements Document
│   ├── tech-stack.md           # Technology stack specifications
│   └── filesystem.md           # This file - directory structure
├── .github/                    # GitHub-specific configuration (future)
│   └── workflows/              # GitHub Actions CI/CD workflows
├── e2e/                        # Playwright end-to-end tests
│   ├── *.spec.ts              # E2E test files
│   └── fixtures/              # Test fixtures and data
├── src/                        # Main application source code
│   ├── components/            # Vue components (to be created)
│   │   ├── ui/                # Reusable UI components
│   │   ├── forms/             # Form-specific components
│   │   ├── map/               # Map-related components
│   │   └── auth/              # Authentication components
│   ├── stores/                # Pinia state management
│   │   ├── counter.ts         # Example store (exists)
│   │   ├── auth.ts            # Authentication store (future)
│   │   ├── notes.ts           # Notes management store (future)
│   │   └── settings.ts        # Application settings store (future)
│   ├── router/                # Vue Router configuration
│   │   └── index.ts           # Main router setup
│   ├── lib/                   # Utility functions and helpers
│   │   ├── utils.ts           # CSS and general utilities (exists)
│   │   ├── auth.ts            # OAuth/authentication utilities (future)
│   │   ├── crypto.ts          # Client-side encryption utilities (future)
│   │   ├── api/               # API client utilities (future)
│   │   │   ├── osm.ts         # OpenStreetMap API client
│   │   │   ├── overpass.ts    # Overpass API client
│   │   │   ├── nominatim.ts   # Nominatim API client
│   │   │   └── openai.ts      # OpenAI API client
│   │   └── types/             # TypeScript type definitions (future)
│   │       ├── auth.ts        # Authentication types
│   │       ├── notes.ts       # Notes and data types
│   │       └── api.ts         # API response types
│   ├── assets/                # Static assets (future)
│   │   ├── images/            # Image files
│   │   └── icons/             # Custom icons (if any)
│   ├── App.vue                # Root Vue component
│   ├── main.ts                # Application entry point
│   └── style.css              # Global Tailwind imports
├── tests/                     # Test files and configuration
│   ├── unit/                  # Vitest unit tests
│   │   ├── *.spec.ts          # Unit test files
│   │   ├── *.test.ts          # Alternative test files
│   │   ├── components/        # Component-specific tests (future)
│   │   ├── stores/            # Store-specific tests (future)
│   │   └── lib/               # Utility function tests (future)
│   └── fixtures/              # Test fixtures and mock data
├── public/                    # Static public assets
│   ├── favicon.ico            # Application favicon
│   └── manifest.json          # PWA manifest (future)
├── .nvmrc                     # Node.js version specification
├── lefthook.yml               # Git hooks configuration
├── package.json               # Node.js dependencies and scripts
├── bun.lockb                  # Bun lockfile
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── vitest.config.ts           # Vitest testing configuration
├── playwright.config.ts       # Playwright E2E configuration
├── biome.json                 # Biome formatting/linting configuration
├── tailwind.config.js         # TailwindCSS configuration (future)
├── components.json            # shadcn-vue components configuration (future)
├── index.html                 # Main HTML template
├── README.md                  # Project documentation
├── CLAUDE.md                  # Claude AI development guidelines
└── LICENSE                    # GNU GPL v3.0 license
```

## Directory Guidelines

### Source Code Organization (`src/`)

#### Components (`src/components/`)
- **Structure**: Organize by feature/domain rather than by type
- **Naming**: PascalCase for component files (`UserProfile.vue`)
- **Organization**:
  ```
  components/
  ├── ui/           # Reusable UI components (buttons, inputs, modals)
  ├── forms/        # Form-specific components
  ├── map/          # Map and location-related components
  ├── notes/        # Note management components
  ├── auth/         # Authentication/login components
  └── layout/       # Layout and navigation components
  ```

#### Stores (`src/stores/`)
- **Pattern**: Domain-specific stores, not one large store
- **Naming**: camelCase for store files (`notesStore.ts`)
- **Structure**: Use Pinia setup syntax for better TypeScript inference
- **Examples**:
  - `authStore.ts` - User authentication state
  - `notesStore.ts` - Notes management and CRUD operations
  - `mapStore.ts` - Map state and location data
  - `settingsStore.ts` - Application settings and preferences

#### Utilities (`src/lib/`)
- **Purpose**: Reusable functions, API clients, type definitions
- **Organization**:
  ```
  lib/
  ├── utils.ts          # General utilities (CSS helpers, formatters)
  ├── auth.ts           # OAuth/authentication helpers
  ├── crypto.ts         # Client-side encryption utilities
  ├── api/              # API client modules
  ├── types/            # TypeScript type definitions
  └── constants.ts      # Application constants
  ```

#### API Clients (`src/lib/api/`)
- **Pattern**: One file per external API
- **Error Handling**: Consistent error handling patterns
- **Rate Limiting**: Implement rate limiting for external APIs
- **Examples**:
  - `osm.ts` - OpenStreetMap API client (OAuth-authenticated)
  - `overpass.ts` - Overpass API client (read-only queries)
  - `nominatim.ts` - Nominatim geocoding client
  - `openai.ts` - OpenAI API client (transcription, OCR)

### Testing Organization (`tests/`)

#### Unit Tests (`tests/unit/`)
- **Structure**: Mirror the `src/` directory structure
- **Naming**: Use `.spec.ts` or `.test.ts` suffixes
- **Organization**:
  ```
  tests/unit/
  ├── components/       # Component tests
  ├── stores/           # Store tests
  ├── lib/              # Utility function tests
  └── __mocks__/        # Mock definitions
  ```

#### E2E Tests (`e2e/`)
- **Pattern**: Organize by user workflows, not by pages
- **Naming**: Descriptive workflow names (`user-authentication.spec.ts`)
- **Structure**: Use Page Object Model for maintainability

### Configuration Files (Root)

#### Essential Configuration
- **package.json**: Dependencies, scripts, engines requirements
- **tsconfig.json**: TypeScript configuration with path mapping
- **vite.config.ts**: Build configuration with Vue plugin
- **biome.json**: Code formatting and linting rules
- **lefthook.yml**: Git hooks for quality assurance

#### Testing Configuration
- **vitest.config.ts**: Unit test configuration
- **playwright.config.ts**: E2E test configuration

#### Development Configuration
- **.nvmrc**: Node.js version for automatic version switching
- **components.json**: UI component library configuration
- **tailwind.config.js**: TailwindCSS customization

## File Naming Conventions

### Vue Components
- **Format**: PascalCase (`UserProfileCard.vue`)
- **Pattern**: Descriptive names indicating purpose
- **Examples**: `NoteEditor.vue`, `MapContainer.vue`, `AuthLogin.vue`

### TypeScript Files
- **Format**: camelCase for utilities, PascalCase for classes
- **Store Files**: `authStore.ts`, `notesStore.ts`
- **Utility Files**: `cryptoUtils.ts`, `apiClient.ts`
- **Type Files**: `authTypes.ts`, `noteTypes.ts`

### Test Files
- **Unit Tests**: `ComponentName.spec.ts` or `functionName.test.ts`
- **E2E Tests**: `user-workflow-name.spec.ts`
- **Mock Files**: `__mocks__/moduleName.ts`

### Configuration Files
- **Format**: kebab-case or standard names
- **Examples**: `vite.config.ts`, `biome.json`, `lefthook.yml`

## Path Mapping

TypeScript path mapping configured in `tsconfig.json`:

```typescript
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Usage Examples**:
```typescript
// Instead of relative imports
import { authStore } from '../../../stores/authStore'

// Use path mapping
import { authStore } from '@/stores/authStore'
```

## Future Structure Considerations

### PWA Support (v1.1)
```
src/
├── sw.ts                      # Service Worker
└── manifest.json              # PWA manifest
```

### Multi-language Support
```
src/
├── locales/                   # i18n translation files
│   ├── en.json               # English translations
│   └── pl.json               # Polish translations
└── i18n.ts                   # i18n configuration
```

### Component Library
```
src/components/ui/             # Reusable UI components
├── Button/
│   ├── Button.vue
│   ├── Button.stories.ts     # Storybook stories (future)
│   └── Button.spec.ts        # Component tests
└── Input/
    ├── Input.vue
    └── Input.spec.ts
```

### Backend Integration
```
src/lib/api/
├── client.ts                  # Base API client configuration
├── surrealdb.ts              # SurrealDB client
└── types.ts                  # API response types
```

## Development Workflow

### Creating New Features
1. **Plan**: Define component structure and data flow
2. **Types**: Create TypeScript interfaces in `src/lib/types/`
3. **Store**: Create Pinia store if needed in `src/stores/`
4. **Components**: Create Vue components in appropriate `src/components/` subdirectory
5. **Tests**: Write unit tests in `tests/unit/` mirroring source structure
6. **E2E**: Add E2E tests for complete user workflows

### File Creation Order
1. Types and interfaces
2. Store (if needed)
3. Utility functions
4. Vue components
5. Unit tests
6. E2E tests (for complete workflows)

This structure supports scalability while maintaining clear separation of concerns and follows Vue 3 + TypeScript best practices.