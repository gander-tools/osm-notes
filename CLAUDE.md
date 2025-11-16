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
- **Frontend**: Vue 3 (Composition API + `<script setup>`), TypeScript 5, Vite 7
- **Styling**: TailwindCSS v4 with utility classes, Tailwind merge, CVA for component variants
- **State Management**: Pinia stores with setup syntax
- **Routing**: Vue Router 4 with lazy loading
- **Icons**: Lucide Vue Next
- **Testing**: Vitest (unit) + Playwright (e2e) + jsdom environment
- **Code Quality**: Biome for formatting/linting, strict TypeScript
- **Future Backend**: SurrealDB with zero-knowledge client-side encryption

### Directory Structure
```
src/
├── components/          # Vue components (to be created)
├── stores/             # Pinia stores (counter.ts example exists)
├── router/             # Vue Router configuration (index.ts)
├── lib/                # Utility functions (utils.ts for CSS helpers)
└── style.css          # Global Tailwind imports

tests/
├── unit/               # Unit test files (*.spec.ts, *.test.ts)
└── e2e/                # Playwright e2e tests (separate config)
```

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

