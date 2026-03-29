# myDevDock

<p align="center">
  <img src="docs/readme/hero-dashboard.png" alt="myDevDock — neon glass dashboard with projects and groups" width="780" />
</p>

<p align="center">
  <strong>myDevDock</strong> is a desktop app for developers who juggle many local repositories.<br />
  Built with <strong>Tauri v2</strong>, <strong>React 19</strong>, and <strong>Rust</strong>. Your data stays on your machine — no cloud account required.
</p>

---

## What it does

| Area | Capability |
|------|------------|
| **Projects** | Register folders manually or **scan a parent directory** (depth-limited walk). |
| **Smart scan** | Treats **one workspace root** per monorepo (Nx, Turborepo, pnpm/npm **workspaces**, Lerna, Rush, **Melos**, Cargo **`[workspace]`**, **Go** `go.work`, **Bazel** roots). Does not register every inner `apps/*` / `packages/*` package. After a match, **stops descending** that tree. |
| **Git** | Branch, last commit message, **last commit timestamp (ISO)** for sorting, uncommitted change count, status for UI (clean / uncommitted / …). |
| **Stacks** | Heuristic detection from `package.json`, `Cargo.toml`, `go.mod`, Python files, etc. |
| **Editors** | Open project path in Cursor, VS Code, Zed, WebStorm, Sublime, Neovim, Antigravity; default editor + per-launch picker. **Probable editor** hint from `.cursor`, `.vscode`, etc. |
| **Usage sort** | **`lastOpenedAt`** when opened from the hub; sort also by name, date added, **Git commit time**, Git status. Settings persisted in Rust JSON state. |
| **Groups** | Create groups, assign projects (incl. drag-and-drop), **launch all** with configurable delay. |
| **Raycast** | Configure a Script Commands folder once, then generate `.sh` launchers per **project** or **group** from the UI. Scripts target your chosen editor (with a macOS `open -a` fallback when the CLI is not on Raycast’s PATH). Removing a project or group removes its stored launcher file when applicable. |
| **UI** | Neon / glass aesthetic; **multiple UI themes** (`data-theme` + CSS variables in `src/styles.css`). **i18n** via `react-i18next`. |
| **Multi-window** | Separate settings UI path; **Tauri events** sync **theme** and **app settings** across webviews instantly. |
| **Persistence** | Single JSON file under the app data directory (projects, groups, settings). |
| **Dev without desktop** | `bun run dev` uses **mock** services when `window.__TAURI__` is missing. |

---

## Screenshots & demos

### Project grid

Browse registered repos with stack tags, Git status, and quick actions.

<p align="center">
  <img src="docs/readme/projects-grid.png" alt="Project cards grid with stack and Git metadata" width="780" />
</p>

### Groups — launch in your editor

Create groups, reorder with drag-and-drop, and open every project in your default editor (with optional delay between launches).

<p align="center">
  <img src="docs/readme/groups-open-editor.gif" alt="Screen recording: launching a group opens each project in the editor" width="780" />
</p>

### Raycast launchers

Generate Script Command `.sh` files for a project or group, then run them from Raycast to open the same paths in your selected editor.

<p align="center">
  <img src="docs/readme/groups-raycast-open-editor.gif" alt="Screen recording: Raycast running a myDevDock-generated script to open group projects in the editor" width="780" />
</p>

*GIFs are larger files; they may take a moment to load on slow connections.*

---

## Tech stack

- **Package manager**: [Bun](https://bun.sh) (`bun install`, `bun run …`)
- **Frontend**: Vite 6, TypeScript, Tailwind CSS v4, Zustand, Framer Motion, dnd-kit, Lucide
- **Desktop**: Tauri 2, Rust 2021 (`src-tauri/`)

## Quick start

```bash
bun install

# Web only (mocks, no Rust)
bun run dev

# Full desktop app
bun run tauri dev

# Production web build
bun run build

# Desktop release bundle
bun run tauri build
```

Rust check:

```bash
cd src-tauri && cargo check
```

## Repository layout (short)

| Path | Role |
|------|------|
| [`src/app/`](src/app/) | App shell, dashboard, groups, projects, layouts |
| [`src/lib/`](src/lib/) | Shared UI kit (`@org/ui-kit`), models alias `@org/models`, services `@org/services`, theme/sort helpers |
| [`src-tauri/src/lib.rs`](src-tauri/src/lib.rs) | Tauri commands, scan logic, persistence, Git/stack detection |
| [`docs/`](docs/) | Human + **AI-oriented** docs ([`docs/00-ai-brief.md`](docs/00-ai-brief.md)) |

## Documentation

- **Index**: [`docs/README.md`](docs/README.md)
- **AI / agents quick brief**: [`docs/00-ai-brief.md`](docs/00-ai-brief.md)
- **Editor rules**: [`AGENTS.md`](AGENTS.md), [`CLAUDE.md`](CLAUDE.md)

## License

[MIT](LICENSE) — Copyright (c) 2026 Luis Eduardo Farfán Melgar.
