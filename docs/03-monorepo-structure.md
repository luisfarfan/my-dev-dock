# 3. Estructura del Monorepo

[← Volver al Índice](./README.md)

> **Estado actual (2026):** el código vive en un **solo paquete Tauri** en la raíz del repo (Bun + Vite + React; Rust en `src-tauri/`). El árbol extenso más abajo describe un **layout tipo Nx / apps+libs** que ya **no aplica** tal cual; úsalo solo como referencia conceptual.

---

## 📁 Árbol real del repo (hoy)

```
dev-hub-tauri/
├── src/                    # React + Vite (app + lib compartida)
│   ├── app/
│   ├── lib/                # models, ui-kit barrel, services (aliases @org/*)
│   ├── main.tsx
│   └── styles.css
├── src-tauri/              # Rust / Tauri v2
├── index.html
├── vite.config.ts
├── package.json
└── bun.lock
```

---

## 📁 Árbol de Carpetas (Objetivo Final — histórico / Nx)

```
dev-hub/                              # Raíz del monorepo Nx
│
├── apps/
│   ├── desktop/                      # 🖥️ App Tauri (wrapper nativo)
│   │   ├── src-tauri/                # Código Rust (backend nativo)
│   │   │   ├── src/
│   │   │   │   ├── main.rs           # Entry point de Tauri
│   │   │   │   ├── lib.rs            # Registro de commands
│   │   │   │   ├── commands/         # Tauri commands (API nativa)
│   │   │   │   │   ├── mod.rs
│   │   │   │   │   ├── project.rs    # add_project, remove_project, list_projects
│   │   │   │   │   ├── git.rs        # get_git_status, get_branch, get_last_commit
│   │   │   │   │   ├── detect.rs     # detect_stack
│   │   │   │   │   └── system.rs     # open_project, open_in_editor
│   │   │   │   ├── storage/          # Persistencia local
│   │   │   │   │   ├── mod.rs
│   │   │   │   │   └── json_store.rs # Lectura/escritura de JSON
│   │   │   │   └── models/           # Structs de Rust
│   │   │   │       ├── mod.rs
│   │   │   │       └── project.rs
│   │   │   ├── Cargo.toml            # Dependencias Rust
│   │   │   ├── tauri.conf.json       # Configuración de Tauri
│   │   │   ├── build.rs              # Build script
│   │   │   └── icons/                # Íconos de la app
│   │   ├── package.json              # Config Nx del proyecto Tauri
│   │   └── project.json              # (opcional) config adicional Nx
│   │
│   ├── dev-hub/                      # ⚛️ Frontend React + Vite
│   │   ├── src/
│   │   │   ├── main.tsx              # Entry point React
│   │   │   ├── App.tsx               # Root component
│   │   │   ├── app/                  # Componentes de la app
│   │   │   │   ├── layout/
│   │   │   │   │   ├── TopBar.tsx
│   │   │   │   │   ├── FilterBar.tsx
│   │   │   │   │   └── MainLayout.tsx
│   │   │   │   ├── projects/
│   │   │   │   │   ├── ProjectCard.tsx
│   │   │   │   │   ├── ProjectGrid.tsx
│   │   │   │   │   └── AddProjectDialog.tsx
│   │   │   │   ├── groups/
│   │   │   │   │   ├── GroupCard.tsx
│   │   │   │   │   └── GroupManager.tsx
│   │   │   │   └── settings/
│   │   │   │       └── SettingsPanel.tsx
│   │   │   ├── stores/               # Zustand stores
│   │   │   │   ├── useProjectStore.ts
│   │   │   │   ├── useGroupStore.ts
│   │   │   │   └── useUIStore.ts
│   │   │   ├── services/             # Bridge hacia Tauri
│   │   │   │   ├── projectService.ts
│   │   │   │   ├── gitService.ts
│   │   │   │   └── systemService.ts
│   │   │   ├── hooks/                # Custom hooks
│   │   │   │   ├── useGitPolling.ts
│   │   │   │   └── useProjectSearch.ts
│   │   │   ├── types/                # Tipos locales del frontend
│   │   │   │   └── index.ts
│   │   │   └── styles/
│   │   │       ├── globals.css       # Estilos globales + Tailwind
│   │   │       └── theme.css         # Variables CSS del tema neon
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── tsconfig.json
│   │   ├── tsconfig.app.json
│   │   └── components.json          # Config shadcn/ui
│   │
│   └── dev-hub-e2e/                  # 🧪 E2E Tests (Playwright)
│       ├── src/
│       │   └── dev-hub.spec.ts
│       ├── playwright.config.ts
│       └── package.json
│
├── libs/
│   ├── models/                       # 📦 Tipos/Interfaces compartidos
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── project.ts           # Project, GitStatus, Stack
│   │   │   └── group.ts             # Group, GroupConfig
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui-kit/                       # 🎨 Componentes UI reutilizables
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   │   ├── GlassCard.tsx
│   │   │   │   ├── NeonButton.tsx
│   │   │   │   ├── GlowBadge.tsx
│   │   │   │   ├── SearchInput.tsx
│   │   │   │   └── FilterChip.tsx
│   │   │   └── ui/                   # shadcn/ui components
│   │   │       ├── button.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── input.tsx
│   │   │       └── ...
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── services/                     # 🔌 Servicios compartidos
│       ├── src/
│       │   ├── index.ts
│       │   ├── tauri-bridge.ts       # Abstracciones sobre invoke()
│       │   └── storage.ts            # Helpers de persistencia
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                             # 📚 Documentación del proyecto
│   ├── README.md                     # Índice
│   ├── 01-project-overview.md
│   ├── 02-architecture.md
│   ├── ...
│   └── 10-conventions.md
│
├── .agents/                          # 🤖 Config AI agents (Antigravity)
├── .claude/                          # 🤖 Config Claude Code
├── .cursor/                          # 🤖 Config Cursor
├── .gemini/                          # 🤖 Config Gemini
├── .codex/                           # 🤖 Config Codex
│
├── nx.json                           # Config principal de Nx
├── package.json                      # Dependencias root
├── pnpm-workspace.yaml               # Workspace pnpm
├── tsconfig.base.json                # TypeScript base config
├── eslint.config.mjs                 # ESLint config
├── .editorconfig
├── .prettierrc
└── .gitignore
```

---

## 🏗️ Proyectos Nx

### Aplicaciones (`apps/`)

| Proyecto | Nombre Nx | Tags | Descripción |
|----------|-----------|------|-------------|
| `apps/desktop` | `dev-hub` | `scope:desktop`, `type:app` | App Tauri (Rust + wrapper) |
| `apps/dev-hub` | `dev-hub-ui` | `scope:frontend`, `type:app` | Frontend React + Vite |
| `apps/dev-hub-e2e` | `dev-hub-e2e` | `scope:frontend`, `type:e2e` | E2E tests |

### Librerías (`libs/`)

| Proyecto | Nombre Nx | Tags | Descripción |
|----------|-----------|------|-------------|
| `libs/models` | `@org/models` | `scope:shared`, `type:data` | Interfaces TS compartidas |
| `libs/ui-kit` | `@org/ui-kit` | `scope:shared`, `type:ui` | Componentes UI reutilizables |
| `libs/services` | `@org/services` | `scope:shared`, `type:util` | Servicios y bridge Tauri |

---

## 🔗 Reglas de Dependencia (Module Boundaries)

```
┌─────────────────────────────────────────────────────────┐
│                     PUEDE IMPORTAR DE:                   │
├─────────────┬───────────┬──────────┬───────────────────── │
│ Proyecto    │ models    │ ui-kit   │ services            │
├─────────────┼───────────┼──────────┼───────────────────── │
│ dev-hub-ui  │ ✅         │ ✅        │ ✅                   │
│ ui-kit      │ ✅         │ ─        │ ❌                   │
│ services    │ ✅         │ ❌        │ ─                   │
│ models      │ ─         │ ❌        │ ❌                   │
└─────────────┴───────────┴──────────┴───────────────────── ┘
```

### Regla general:
- `type:app` → puede importar de `type:feature`, `type:ui`, `type:data`, `type:util`
- `type:ui` → solo puede importar de `type:data`
- `type:data` → no puede importar de nadie (base)
- `type:util` → solo puede importar de `type:data`

---

## 📋 Nota sobre Proyectos Legacy

> [!WARNING]
> El workspace actual contiene proyectos del template de ejemplo de Nx (shop, api, shop-e2e, libs/shop/*, libs/api/*, libs/shared/*). Estos **NO son parte** del Developer Project Hub y deben ser removidos antes de comenzar el desarrollo real.

### Proyectos a eliminar:
- `apps/shop` — App e-commerce de ejemplo
- `apps/api` — API Express de ejemplo
- `apps/shop-e2e` — E2E tests del shop
- `libs/shop/*` — Todas las libs del shop
- `libs/api/*` — Todas las libs del api
- `libs/shared/*` — Libs compartidas del ejemplo
