# GEMINI Context: @reely/source (Nx TypeScript Monorepo)

This repository is a production-ready TypeScript monorepo powered by [Nx](https://nx.dev). It contains a collection of interactive web applications and high-quality, publishable utility packages.

## 🚀 Project Overview

### Applications (`apps/`)
- **star-battle**: A high-performance, canvas-based 2D space shooter with local multiplayer, diverse ship types, and procedural environmental effects (asteroids, comets, nebulas). Built with raw TypeScript and custom game physics.
- **free-dom**: A web application serving as a playground and demonstration for the `@reely/dommy` library.
- **rss-async-race**: A web application (internal project).

### Packages (`packages/`)
- **@reely/dommy**: A custom, lightweight UI and DOM manipulation library featuring:
    - JSX support and tag-based element creation.
    - Built-in reactivity system (signals, computed, effects).
    - Async routing capabilities.
- **@reely/async**: Asynchronous utility functions with advanced retry logic.
- **@reely/strings**: Comprehensive string manipulation utilities.
- **@reely/colors**: Color conversion, manipulation, and analysis tools.
- **@reely/logger**: Standardized logging utilities for the monorepo.
- **@reely/utils**: Shared internal utilities (private, not published).

## 🛠️ Tech Stack & Architecture

- **Build System**: [Nx](https://nx.dev) for task orchestration, caching, and dependency management.
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode).
- **Bundler**: [Vite](https://vitejs.dev/) for apps and libraries.
- **Testing**: [Vitest](https://vitest.dev/) for unit and integration testing.
- **Linting & Formatting**: [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/).
- **CI/CD**: GitHub Workflows with Nx Cloud, Husky for git hooks, and Commitlint for conventional commits.
- **Package Management**: npm with Nx Release for versioning and publishing.

## 🏃 Building and Running

Always use `npx nx` to run tasks to benefit from caching and dependency graph awareness.

### Global Commands
- **Install dependencies**: `npm install`
- **Build all projects**: `npx nx run-many -t build`
- **Run all tests**: `npx nx run-many -t test`
- **Lint all projects**: `npx nx run-many -t lint`
- **Type-check all**: `npx nx run-many -t typecheck`
- **Visualize graph**: `npx nx graph`

### Project-Specific Commands
- **Serve star-battle**: `npx nx serve star-battle`
- **Build a package**: `npx nx build <package-name>` (e.g., `npx nx build dommy`)
- **Test a package**: `npx nx test <package-name>`

### Release & Publishing
- **Dry run release**: `npx nx release --dry-run`
- **Perform release**: `npx nx release` (versions and tags)
- **Local Registry**: `npx nx local-registry` (starts Verdaccio)

## 📐 Development Conventions

### Module Boundaries
The project enforces strict architectural boundaries via Nx tags in `eslint.config.mjs`:
- `scope:shared` (utils) can be used by everyone.
- `scope:<package>` can only depend on `scope:shared`.
- Apps have their own scope tags.

### Code Style
- Follow the existing TypeScript patterns.
- Packages in `packages/` should be designed as publishable libraries.
- Prefer `@reely/dommy` for new UI development when applicable.
- Use `raw` TypeScript/Canvas for high-performance graphics as seen in `star-battle`.

### Testing
- Every new feature or fix should include corresponding Vitest tests.
- Run `npx nx affected -t test` before pushing to ensure no regressions.

### Commits
- Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`, `chore:`).
- Husky and Commitlint will validate messages on commit.
