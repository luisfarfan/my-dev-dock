# AI / agent brief — Developer Project Hub

**Purpose**: Single page for coding agents (Cursor, Claude, etc.) to understand what this repo *is*, what it *does*, and where to change things. Read [`AGENTS.md`](../AGENTS.md) for mandatory workflow rules.

## Product type

- **Tauri v2 desktop app** (not a hosted web product). Frontend + Rust in one repo.
- **Offline-first**: project metadata and settings in a **local JSON file** (path resolved in Rust via Tauri app data dir).

## User-facing capabilities (ground truth for docs)

1. **Projects**
   - `register_project(path)` — add one folder; refreshes Git/stack heuristics.
   - `scan_directory(basePath)` — walk under a parent folder (max depth 5, skips `node_modules`, `.git`, `target`, `dist`, `build`, `.nx`, `.dart_tool`, `coverage`).
   - **Workspace-aware scan**: registers **strict workspace roots** (Nx `nx.json`, Turborepo `turbo.json`, `pnpm-workspace.yaml`, `package.json` **workspaces**, Lerna, Rush, **Melos** `melos.yaml`, **Rust** `Cargo.toml` with `[workspace]`, **Go** `go.work`, **Bazel** `WORKSPACE` / `MODULE.bazel`). Inner `package.json` apps under such a root are **skipped** unless they are themselves a workspace root (nested case is rare).
   - After a directory is successfully registered from the walk, **`skip_current_dir`** avoids descending further (performance + no duplicate children).
   - `remove_project`, `clear_all`.

2. **Git (per project path)**
   - Branch, last commit **subject**, **last commit ISO timestamp** (`lastCommitAt`) for sorting, porcelain-based uncommitted count, simplified status string for UI.

3. **Stack detection**
   - Rust: reads manifests / files under project path (`package.json` dependency substring checks, `Cargo.toml`, `go.mod`, Python markers, etc.). See `detect_*` functions in `src-tauri/src/lib.rs`.

4. **Editors**
   - `get_installed_editors`, `open_in_editor(path, editor)`, `launch_project(path)` (default editor), `launch_group(groupId)` with delay from settings.
   - Opening from the hub updates **`lastOpenedAt`** and persists (for MRU sort).

5. **Settings** (`get_settings` / `update_settings`)
   - Default editor, git poll interval (stored; wiring may vary), launch delay, **`sortBy`** / **`sortDirection`** (e.g. `lastOpenedAt`, `lastCommitAt`, `name`, `addedAt`, `status`).
   - Raycast integration settings: **`raycastScriptsPath`** (user-selected Script Commands folder).
   - Frontend applies sort in [`src/app/features/dashboard/hooks/use-dashboard.ts`](../src/app/features/dashboard/hooks/use-dashboard.ts) via [`src/lib/project-sort.ts`](../src/lib/project-sort.ts).

6. **Groups**
   - CRUD + `launch_group`. UI uses **dnd-kit** to assign projects to groups.

7. **UI / theme**
   - Multiple visual themes: `data-theme` on `<html>`, Zustand store [`src/app/store/use-ui-theme-store.ts`](../src/app/store/use-ui-theme-store.ts), tokens in [`src/styles.css`](../src/styles.css).
   - **Cross-window sync** (Tauri): [`src/lib/tauri-multi-window-sync.ts`](../src/lib/tauri-multi-window-sync.ts) + listeners in [`src/app/app.tsx`](../src/app/app.tsx).

8. **Raycast launchers**
   - User configures Script Commands folder once in settings.
   - Hub can export `.sh` launchers for:
     - single project (open in selected/default editor),
     - group (open all projects with configured launch delay).
   - Launcher metadata is configurable from UI (title, filename slug, icon preset, keywords).
   - Commands: `detect_raycast_installation`, `export_raycast_launcher`.

9. **i18n**
   - `react-i18next` used in dashboard, cards, command palette, settings-related UI.

## Tauri commands (Rust → frontend)

Registered in `src-tauri/src/lib.rs` `generate_handler!`:

`get_projects`, `get_groups`, `get_settings`, `update_settings`, `scan_directory`, `register_project`, `remove_project`, `get_installed_editors`, `open_in_editor`, `launch_project`, `launch_group`, `sync_project`, `create_group`, `update_group`, `delete_group`, `clear_all`, `detect_raycast_installation`, `export_raycast_launcher`.

Frontend must use **`src/lib/services/`** (`tauri.ts` / `mock.ts`), not raw `invoke()` in components.

## Key files for common tasks

| Task | Location |
|------|----------|
| Scan / workspace rules | `src-tauri/src/lib.rs` — `is_strict_workspace_root`, `has_strict_workspace_ancestor`, `scan_directory` |
| Data models (TS) | `src/lib/models.ts` |
| Project state | `src/app/store/use-project-store.ts` |
| Dashboard list order | `use-dashboard.ts` + `project-sort.ts` |
| Theme | `src/lib/ui-theme.ts`, `use-ui-theme-store.ts`, `styles.css` |
| UI kit export | `src/lib/*` barrel `@org/ui-kit` |

## Non-goals / caveats

- **Not** a Git client replacement (no push/pull/merge UI as core value).
- Scan **nested workspace inside another** may require a second scan or manual register if the outer workspace was matched first and pruned (tradeoff for speed and deduplication).
- Older docs under `docs/06-backend-guide.md` may show **example** command names that differ from the flat `lib.rs` implementation — trust **Rust source** and this brief.

## Doc map

Full index: [`docs/README.md`](./README.md).
