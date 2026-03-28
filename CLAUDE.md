# Developer Project Hub — AI Editor Instructions

> **READ FIRST**: Before making ANY changes, read the [full documentation](./docs/README.md).

## Package manager

- Use **Bun** for this repo: `bun install`, `bun run <script>`, `bunx <tool>`.
- Do **not** use pnpm/npm for day-to-day commands unless the user asks.

## What is this Project?

A **Tauri v2 desktop app** (React + Vite + Rust) that manages **local** development projects: register paths, **smart parent-folder scan** (Nx / Turborepo / pnpm-npm workspaces / Lerna / Rush / Melos / Cargo workspace / Go work / Bazel — one root per workspace, pruned walk), Git info (incl. commit timestamp for sort), stack heuristics, **default editor + launch**, **groups** with drag-and-drop and batch launch, **sort by usage** (`lastOpenedAt` from hub), **UI themes** and **i18n**, **multi-window settings sync** via Tauri events.

**Capability ground truth (keep docs in sync):** [docs/00-ai-brief.md](./docs/00-ai-brief.md). **Human README:** [README.md](./README.md).

## Architecture Summary

- **Frontend**: repo root — React 19 + Vite + TypeScript + Tailwind CSS v4 + Zustand + dnd-kit (`src/`, `index.html`, `vite.config.ts`)
- **Backend**: `src-tauri/` — Rust (Tauri v2)
- **Shared types**: `src/lib/models.ts` (import alias `@org/models`)
- **UI kit**: `src/lib/*` — glass/neon components barrel via `@org/ui-kit`
- **Services**: `src/lib/services/` — Tauri IPC vs mock (`@org/services`)
- **IPC**: Frontend ↔ Rust via `invoke()` / `listen()` (use service layer, not raw `invoke` in components)

## Documentation Map

| Topic | Doc |
|------|-----|
| **AI brief (capabilities + commands)** | [docs/00-ai-brief.md](./docs/00-ai-brief.md) |
| Overview | [docs/01-project-overview.md](./docs/01-project-overview.md) |
| Architecture | [docs/02-architecture.md](./docs/02-architecture.md) |
| Folder layout | [docs/03-monorepo-structure.md](./docs/03-monorepo-structure.md) |
| Tech stack | [docs/04-tech-stack.md](./docs/04-tech-stack.md) |
| Frontend | [docs/05-frontend-guide.md](./docs/05-frontend-guide.md) |
| Backend / Tauri | [docs/06-backend-guide.md](./docs/06-backend-guide.md) |
| Design system | [docs/07-design-system.md](./docs/07-design-system.md) |
| Data models | [docs/08-data-models.md](./docs/08-data-models.md) |
| Development | [docs/09-development-guide.md](./docs/09-development-guide.md) |
| Conventions | [docs/10-conventions.md](./docs/10-conventions.md) |

## Critical Rules

1. **Types** live in `src/lib/models.ts` (or split under `src/lib/` if needed) — avoid duplicating in components.
2. **Reusable UI** under `src/lib/` (neon/glass components); app-specific UI under `src/app/`.
3. **Do not call `invoke()` directly** in React components — use `src/lib/services/`.
4. **Zustand** for shared app state.
5. Prefer **theme / CSS variables** from `src/styles.css` (`@theme`) for colors — avoid arbitrary hex in new code where possible.
6. **Rust commands** should return `Result<T, String>` (or Tauri’s equivalent patterns).
7. **Serde**: `#[serde(rename_all = "camelCase")]` on Rust structs exposed to the frontend.
8. **Mocks**: when `window.__TAURI__` is absent, services use mock implementations.
9. Run scripts via **`bun run`** (see `package.json`).
10. **Design**: neon glass — dark base, glow, glassmorphism.
