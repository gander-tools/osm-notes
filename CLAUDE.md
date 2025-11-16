# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# OSM Notes Project

OSM Notes is a web application enabling advanced OpenStreetMap mappers to collect, aggregate,
and process field data while maintaining full privacy through zero-knowledge encryption.

## Development Commands

### Project Setup
```sh
bun install                    # Install dependencies
```

### Development
```sh
bun dev                        # Start development server with hot reload on localhost:5173
bun preview                    # Preview production build on localhost:4173
```

### Build & Type Checking
```sh
bun run build                  # Full production build (type-check + build)
bun run build-only             # Build without type checking
bun run type-check             # Type check only with vue-tsc
```

### Code Quality
```sh
bun run check                  # Run all Biome checks (format + lint)
bun run check:fix              # Auto-fix all Biome issues
bun run check:format           # Check formatting only
bun run check:format:fix       # Fix formatting issues
bun run check:lint             # Check linting only
bun run check:lint:fix         # Fix linting issues
```

### Testing
```sh
bun test:unit                  # Run Vitest unit tests in watch mode
bun test:unit --run            # Run unit tests once
bun test:unit --coverage       # Run with coverage report
bun test:e2e                   # Run Playwright e2e tests (requires build first)
bun test:e2e --debug           # Run e2e tests in debug mode
bun test:e2e --project=chromium # Run e2e tests on specific browser
npx playwright install         # Install browsers for first-time e2e setup
```

### Single Test Execution
```sh
bun test:unit tests/unit/App.spec.ts         # Run specific unit test file
bun test:unit -t "counter test name"         # Run specific test by name pattern
bun test:e2e e2e/homepage.spec.ts            # Run specific e2e test file
```

## Project Architecture

### Technology Stack

See **[Technology Stack Documentation](./.claude/tech-stack.md)** for complete specifications including:
- Runtime environment (Node.js 22+, Bun 1.3+)
- Frontend framework (Vue 3+, TypeScript, Vite 7+)
- Authentication (OAuth 2.0 with PKCE, osm-auth v3+)
- Testing infrastructure (Vitest, Playwright)
- Code quality tools (Biome, Lefthook 2+)
- Future backend architecture (SurrealDB 2.3+)

### Directory Structure

See **[Filesystem Structure Documentation](./.claude/filesystem.md)** for complete project organization including:
- Source code organization (`src/` structure)
- Testing organization (`tests/` and `e2e/`)
- Configuration files and naming conventions
- Development workflow and file creation guidelines

### Database Schema

See **[SurrealDB Schema Documentation](./.claude/db-schema.md)** for complete database architecture including:
- Zero-knowledge encryption implementation (PBKDF2 + Argon2)
- Table definitions and relationships (User, Note, Data)
- Authentication flow with DEFINE ACCESS
- Client-side integration examples with surrealdb npm package
- Security considerations and performance optimizations

### Key Configuration Files
- `vite.config.ts`: Vite build config with Vue plugin, TailwindCSS, devtools
- `vitest.config.ts`: Test config with jsdom environment, excludes e2e tests
- `playwright.config.ts`: E2e config for Chromium/Firefox/WebKit, dev server integration
- `biome.json`: Formatting (tabs, double quotes) and linting rules
- `tsconfig.json`: TypeScript config with path mapping (`@/*` → `./src/*`)

### Development Patterns
- **Components**: Use Composition API with `<script setup>` syntax
- **State**: Create domain-specific Pinia stores instead of single large store
- **Routing**: Implement lazy loading, route guards, and meta fields for auth/permissions
- **Testing**: Unit tests with Vitest, e2e tests with Playwright, jsdom for DOM testing
- **Encryption**: All user data encrypted client-side (AES-256-GCM), server stores only encrypted content

### Authentication Architecture
- **OAuth 2.0 Flow**: Authorization Code flow with PKCE (Proof Key for Code Exchange)
- **Client Type**: Public client (no client secret required)
- **Library**: osm-auth v3+ for OpenStreetMap OAuth implementation
- **Security Standard**: PKCE replaces deprecated OAuth 2.0 Implicit Flow
- **Token Storage**: localStorage or sessionStorage (OSM tokens don't expire automatically)
- **Required Scopes**: `read_prefs`, `write_prefs`, `write_api`

### Authentication Implementation Guidelines
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

### Browser Requirements
- Development: Chrome/Edge/Brave with Vue devtools extension recommended
- Testing: Chromium, Firefox, WebKit via Playwright
- Custom object formatters enabled for better Vue debugging experience

## FRONTEND

### Guidelines for VUE

#### PINIA

- Create multiple stores based on logical domains instead of a single large store
- Use the setup syntax (defineStore with setup function) for defining stores for better TypeScript inference
- Implement getters for derived state to avoid redundant computations
- Leverage the storeToRefs helper to extract reactive properties while maintaining reactivity
- Use plugins for cross-cutting concerns like persistence, state resets, or dev tools
- Implement actions for asynchronous operations and complex state mutations
- Use composable stores by importing and using stores within other stores
- Leverage the $reset() method to restore initial state when needed
- Implement $subscribe for reactive store subscriptions
- Use TypeScript with proper return type annotations for maximum type safety

#### VUE_CODING_STANDARDS

- Use the Composition API instead of the Options API for better type inference and code reuse
- Implement <script setup> for more concise component definitions
- Use Suspense and async components for handling loading states during code-splitting
- Leverage the defineProps and defineEmits macros for type-safe props and events
- Use the new defineOptions for additional component options
- Implement provide/inject for dependency injection instead of prop drilling in deeply nested components
- Use the Teleport component for portal-like functionality to render UI elsewhere in the DOM
- Leverage ref over reactive for primitive values to avoid unintended unwrapping
- Use v-memo for performance optimization in render-heavy list rendering scenarios
- Implement shallow refs for large objects that don't need deep reactivity

#### VUE_ROUTER

- Use route guards (beforeEach, beforeEnter) for authentication and authorization checks
- Implement lazy loading with dynamic imports for route components to improve performance
- Use named routes instead of hardcoded paths for better maintainability
- Leverage route meta fields to store additional route information like permissions or layout data
- Implement scroll behavior options to control scrolling between route navigations
- Use navigation duplicates handling to prevent redundant navigation to the current route
- Implement the composition API useRouter and useRoute hooks instead of this.$router
- Use nested routes for complex UIs with parent-child relationships
- Leverage route params validation with sensitive: true for parameters that shouldn't be logged
- Implement dynamic route matching with path parameters and regex patterns for flexible routing

## CODING_PRACTICES

### Guidelines for SUPPORT_LEVEL

#### SUPPORT_EXPERT

- Favor elegant, maintainable solutions over verbose code. Assume understanding of language idioms and design patterns.
- Highlight potential performance implications and optimization opportunities in suggested code.
- Frame solutions within broader architectural contexts and suggest design alternatives when appropriate.
- Focus comments on 'why' not 'what' - assume code readability through well-named functions and variables.
- Proactively address edge cases, race conditions, and security considerations without being prompted.
- When debugging, provide targeted diagnostic approaches rather than shotgun solutions.
- Suggest comprehensive testing strategies rather than just example tests, including considerations for mocking, test organization, and coverage.


### Guidelines for VERSION_CONTROL

#### GIT

- Use conventional commits to create meaningful commit messages
- Use feature branches with descriptive names following `feature/*`
- Write meaningful commit messages that explain why changes were made, not just what
- Keep commits focused on single logical changes to facilitate code review and bisection
- Use interactive rebase to clean up history before merging feature branches
- Leverage git hooks to enforce code quality checks before commits and pushes

#### GITHUB

- Use pull request templates to standardize information provided for code reviews
- Implement branch protection rules for `main` to enforce quality checks
- Configure required status checks to prevent merging code that fails tests or linting
- Use GitHub Actions for CI/CD workflows to automate testing and deployment
- Implement CODEOWNERS files to automatically assign reviewers based on code paths
- Use GitHub Projects for tracking work items and connecting them to code changes

#### CONVENTIONAL_COMMITS

- Follow the format: type(scope): description for all commit messages
- Use consistent types (feat, fix, docs, style, refactor, test, chore) across the project
- Define clear scopes based on project_modules to indicate affected areas
- Include issue references in commit messages to link changes to requirements
- Use breaking change footer (!: or BREAKING CHANGE:) to clearly mark incompatible changes
- Configure commitlint to automatically enforce conventional commit format


### Guidelines for STATIC_ANALYSIS

#### BIOME

- Define a consistent biome.json configuration
- Configure editor integration to format on save for immediate feedback
- Use biome.json `.files.ignore[]` to exclude generated files, build artifacts
- Set printWidth based on team preferences (80-120 characters) to improve code readability
- Configure consistent quote style and semicolon usage to match team conventions
- Implement CI checks to ensure all committed code adheres to the defined style
- Configure integration with Prettier to avoid rule conflicts for code formatting
- Use the --write flag in CI/CD pipelines to automatically correct fixable issues
- Implement staged linting with lefthook and lint-staged to prevent committing non-compliant code


## DEVOPS

### Guidelines for CI_CD

#### GITHUB_ACTIONS

- Check if `package.json` exists in project root and summarize key scripts
- Check if `.nvmrc` exists in project root
- Check if `.env.example` exists in project root to identify key `env:` variables
- Always use terminal command: `git branch -a | cat` to verify whether we use `main` or `main` branch
- Always use `env:` variables and secrets attached to jobs instead of global workflows
- Always use `bun install --frozen-lockfile` for Node-based dependency setup
- Extract common steps into composite actions in separate files
- Once you're done, as a final step conduct the following: for each public action always use <tool>"Run Terminal"</tool> to see what is the most up-to-date version (use only major version) - extract tag_name from the response:
- ```bash curl -s https://api.github.com/repos/gander-tools/osm-notes/releases/latest ```

## TESTING

### TDD_METHODOLOGY

#### CORE_PRINCIPLES

**MANDATORY DEVELOPMENT APPROACH**: Test-Driven Development is the default and required methodology for all code development in this project. Code without tests is not acceptable.

**RED → GREEN → REFACTOR Cycle**:
1. **RED**: Write a failing test that describes the expected behavior
2. **GREEN**: Write the minimal amount of code to make the test pass
3. **REFACTOR**: Clean up and improve the code while keeping all tests green

**Test-First Development**:
- Always write the test before writing the implementation
- Focus on behavior, not implementation details
- One failing test at a time
- Commit frequently during the cycle

#### WORKFLOW

**Development Environment Setup**:
```sh
# Terminal 1: Continuous TDD feedback loop
bun test:unit                    # Vitest runs in watch mode by default

# Terminal 2: Manual testing (when needed)
bun dev                          # Development server
```

**TDD Workflow Steps**:
1. Run `bun test:unit` in watch mode (continuous feedback)
2. Write failing test that describes desired behavior (RED phase)
3. Watch test fail (confirms test works correctly)
4. Write minimal code to make test pass (GREEN phase)
5. Watch test pass (confirms implementation works)
6. Refactor code while keeping tests green (REFACTOR phase)
7. Commit with conventional commit message
8. Repeat cycle for next feature/requirement

**Planning Tests**:
```typescript
// Use it.todo() for planning future tests
describe('AuthStore', () => {
	it.todo('should validate user credentials')
	it.todo('should handle login errors')
	it.todo('should persist session data')

	it('initializes with empty state', () => {
		// Implement this test first
	})
})
```

#### TEST_ORGANIZATION

**File Structure Standards**:
- Tests mirror source structure: `src/components/Note.vue` → `tests/unit/components/Note.spec.ts`
- Use descriptive `describe` blocks for logical grouping
- One assertion per test when possible (clear failure messages)
- Follow AAA pattern: Arrange, Act, Assert

**Naming Conventions**:
```typescript
// Good: Describes behavior
describe('Note component', () => {
	it('renders title when provided as prop', () => {})
	it('emits save event when save button is clicked', () => {})
	it('shows validation error for empty required fields', () => {})
})

// Bad: Describes implementation
describe('Note component', () => {
	it('has a title prop', () => {})
	it('calls handleSave method', () => {})
	it('sets error state', () => {})
})
```

#### COMPONENT_TESTING_TDD

**Vue 3 Component TDD Pattern**:
```typescript
// RED: Write failing test first
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Note from '@/components/Note.vue'

describe('Note component', () => {
	it('renders note title when provided', () => {
		const wrapper = mount(Note, {
			props: { title: 'Bridge inspection' }
		})

		expect(wrapper.find('h2').text()).toBe('Bridge inspection')
	})

	it('emits save event with note data when saved', () => {
		const wrapper = mount(Note, {
			props: { title: 'Test note', content: 'Test content' }
		})

		wrapper.find('button[data-testid="save"]').trigger('click')

		expect(wrapper.emitted('save')).toBeTruthy()
		expect(wrapper.emitted('save')[0]).toEqual([{
			title: 'Test note',
			content: 'Test content'
		}])
	})
})

// GREEN: Create minimal implementation to pass tests
// REFACTOR: Improve component while keeping tests green
```

**Testing Checklist for Components**:
- Props and their validation
- Events and their payloads
- Conditional rendering
- User interactions (click, input, form submission)
- Computed properties behavior
- Slot content rendering

#### STORE_TESTING_TDD

**Pinia Store TDD Pattern**:
```typescript
// RED: Test store behavior first
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useNotesStore } from '@/stores/notes'

describe('NotesStore', () => {
	beforeEach(() => {
		setActivePinia(createPinia())
	})

	it('initializes with empty notes array', () => {
		const store = useNotesStore()
		expect(store.notes).toEqual([])
		expect(store.totalCount).toBe(0)
	})

	it('adds note when addNote action is called', () => {
		const store = useNotesStore()
		const newNote = { id: '1', title: 'Test', content: 'Content' }

		store.addNote(newNote)

		expect(store.notes).toContain(newNote)
		expect(store.totalCount).toBe(1)
	})
})

// GREEN: Implement store with minimal logic
// REFACTOR: Optimize getters, actions, add error handling
```

**Testing Checklist for Stores**:
- Initial state values
- Getters with derived state
- Actions and state mutations
- Async actions with API calls (mocked)
- Error handling scenarios
- State persistence (if applicable)

#### UTILITY_TESTING_TDD

**Pure Function TDD Pattern**:
```typescript
// RED: Define expected behavior first
import { describe, it, expect } from 'vitest'
import { formatNoteDate, validateCoordinates } from '@/lib/utils'

describe('formatNoteDate', () => {
	it('formats date for display in note list', () => {
		const date = new Date('2024-01-15T10:30:00Z')
		expect(formatNoteDate(date)).toBe('Jan 15, 2024 10:30')
	})

	it('handles invalid date gracefully', () => {
		expect(formatNoteDate(null)).toBe('Invalid date')
	})
})

describe('validateCoordinates', () => {
	it('returns true for valid latitude and longitude', () => {
		expect(validateCoordinates(52.5200, 13.4050)).toBe(true)
	})

	it('returns false for out-of-range coordinates', () => {
		expect(validateCoordinates(100, 200)).toBe(false)
	})
})

// GREEN: Implement functions with minimal logic
// REFACTOR: Optimize performance, add edge cases
```

#### VITEST_INTEGRATION

**Leverage Vitest Features for TDD**:
- **Watch Mode**: Default behavior provides instant feedback for RED/GREEN cycle
- **Focus Testing**: Use `it.only()` or `describe.only()` during development
- **Test Planning**: Use `it.todo()` for backlog of tests to write
- **TypeScript**: Use `expectTypeOf()` for type-level assertions
- **Mocking**: Use `vi.fn()`, `vi.spyOn()`, `vi.mock()` for isolation

**TDD-Optimized Commands**:
```sh
bun test:unit                    # Default watch mode for TDD workflow
bun test:unit --run              # Single run for CI/pre-push
bun test:unit -t "note"          # Filter tests by name during focused development
bun test:unit --coverage         # Coverage analysis (use sparingly)
```

#### TDD_ENFORCEMENT

**Code Standards**:
- **No implementation without tests**: All functions, components, and stores must have tests written first
- **Minimal implementation**: Write only enough code to make the current test pass
- **Behavior-driven**: Tests should describe what the code does, not how it does it
- **Refactoring required**: Green tests are not the end - clean up the code

**Git Workflow Integration**:
- **Commits allowed during RED phase**: Failing tests can be committed (work in progress)
- **Pre-push hook**: Full test suite must pass before pushing to remote
- **CI/CD enforcement**: All tests must pass for merge approval
- **Conventional commits**: Include test information in commit messages

**Anti-Patterns to Avoid**:
```typescript
// ❌ DON'T: Write implementation first
export function addNote(note) {
	// Implementation without test
}

// ❌ DON'T: Test implementation details
it('calls private method _validateNote', () => {
	// Testing internals, not behavior
})

// ❌ DON'T: Overly complex test setup
it('should work', () => {
	// 50 lines of setup code
})

// ✅ DO: Write test first
it('adds note to the store when addNote is called', () => {
	// Clear behavior description
})

// ✅ DO: Test public interface
it('returns validation error for invalid note data', () => {
	// Testing observable behavior
})

// ✅ DO: Simple, focused tests
it('calculates total when items are added', () => {
	// One thing at a time
})
```

#### REAL_WORLD_EXAMPLE

**Complete TDD Cycle: Adding Note Encryption Feature**

**Step 1 - RED Phase**:
```typescript
// tests/unit/lib/encryption.spec.ts
import { describe, it, expect } from 'vitest'
import { encryptNote, decryptNote } from '@/lib/encryption'

describe('Note Encryption', () => {
	it('encrypts note content with user key', () => {
		const note = { title: 'Secret', content: 'Classified data' }
		const userKey = 'user-encryption-key'

		const encrypted = encryptNote(note, userKey)

		expect(encrypted).not.toContain('Secret')
		expect(encrypted).not.toContain('Classified data')
		expect(encrypted).toMatch(/^[a-f0-9]{64,}$/) // Hex string
	})

	it('decrypts note content with same key', () => {
		const original = { title: 'Secret', content: 'Classified data' }
		const userKey = 'user-encryption-key'

		const encrypted = encryptNote(original, userKey)
		const decrypted = decryptNote(encrypted, userKey)

		expect(decrypted).toEqual(original)
	})
})

// Run: bun test:unit
// Result: FAIL - encryptNote/decryptNote functions don't exist ✓ (RED complete)
```

**Step 2 - GREEN Phase**:
```typescript
// src/lib/encryption.ts - Minimal implementation
export function encryptNote(note: any, key: string): string {
	// Minimal AES encryption (simplified for example)
	const jsonString = JSON.stringify(note)
	return btoa(jsonString + key) // Basic encoding to pass test
}

export function decryptNote(encrypted: string, key: string): any {
	const decoded = atob(encrypted)
	const jsonString = decoded.replace(key, '')
	return JSON.parse(jsonString)
}

// Run: bun test:unit
// Result: PASS - Tests pass ✓ (GREEN complete)
```

**Step 3 - REFACTOR Phase**:
```typescript
// src/lib/encryption.ts - Production-ready implementation
import { AES, enc } from 'crypto-js'

export function encryptNote(note: NoteData, userKey: string): string {
	const jsonString = JSON.stringify(note)
	const encrypted = AES.encrypt(jsonString, userKey).toString()
	return encrypted
}

export function decryptNote(encrypted: string, userKey: string): NoteData {
	const decrypted = AES.decrypt(encrypted, userKey)
	const jsonString = decrypted.toString(enc.Utf8)
	return JSON.parse(jsonString)
}

// Add error handling, type safety, validation...
// Run: bun test:unit
// Result: PASS - Tests still pass with better implementation ✓ (REFACTOR complete)
```

**Step 4 - Commit**:
```bash
git add tests/unit/lib/encryption.spec.ts src/lib/encryption.ts
git commit -m "feat(encryption): add note encryption with AES-256

Implements zero-knowledge encryption for note content.
Uses CryptoJS for production-ready AES encryption.
Follows TDD methodology: RED → GREEN → REFACTOR.

Tests cover basic encryption/decryption cycle with user key."
```

### Guidelines for UNIT

#### VITEST

- Leverage the `vi` object for test doubles - Use `vi.fn()` for function mocks, `vi.spyOn()` to monitor existing functions, and `vi.stubGlobal()` for global mocks. Prefer spies over mocks when you only need to verify interactions without changing behavior.
- main `vi.mock()` factory patterns - Place mock factory functions at the top level of your test file, return typed mock implementations, and use `mockImplementation()` or `mockReturnValue()` for dynamic control during tests. Remember the factory runs before imports are processed.
- Create setup files for reusable configuration - Define global mocks, custom matchers, and environment setup in dedicated files referenced in your `vitest.config.ts`. This keeps your test files clean while ensuring consistent test environments.
- Use inline snapshots for readable assertions - Replace complex equality checks with `expect(value).toMatchInlineSnapshot()` to capture expected output directly in your test file, making changes more visible in code reviews.
- Monitor coverage with purpose and only when asked - Configure coverage thresholds in `vitest.config.ts` to ensure critical code paths are tested, but focus on meaningful tests rather than arbitrary coverage percentages.
- Make watch mode part of your workflow - Run `vitest --watch` during development for instant feedback as you modify code, filtering tests with `-t` to focus on specific areas under development.
- Explore UI mode for complex test suites - Use `vitest --ui` to visually navigate large test suites, inspect test results, and debug failures more efficiently during development.
- Handle optional dependencies with smart mocking - Use conditional mocking to test code with optional dependencies by implementing `vi.mock()` with the factory pattern for modules that might not be available in all environments.
- Configure jsdom for DOM testing - Set `environment: 'jsdom'` in your configuration for frontend component tests and combine with testing-library utilities for realistic user interaction simulation.
- Structure tests for maintainability - Group related tests with descriptive `describe` blocks, use explicit assertion messages, and follow the Arrange-Act-Assert pattern to make tests self-documenting.
- Leverage TypeScript type checking in tests - Enable strict typing in your tests to catch type errors early, use `expectTypeOf()` for type-level assertions, and ensure mocks preserve the original type signatures.


### Guidelines for E2E

#### PLAYWRIGHT

- Initialize configuration only with Chromium/Desktop Chrome browser
- Use browser contexts for isolating test environments
- Implement the Page Object Model for maintainable tests
- Use locators for resilient element selection
- Leverage API testing for backend validation
- Implement visual comparison with expect(page).toHaveScreenshot()
- Use the codegen tool for test recording
- Leverage trace viewer for debugging test failures
- Implement test hooks for setup and teardown
- Use expect assertions with specific matchers
- Leverage parallel execution for faster test runs

## DATABASE

### Guidelines for NOSQL

#### SURREALDB

- Use the aggregation framework for complex queries instead of multiple queries
- Implement schema validation to ensure data consistency
- Use indexes for frequently queried fields to improve performance

