# 2. Arquitectura del Sistema

[← Volver al Índice](./README.md)

---

## 📐 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        TAURI SHELL                              │
│  ┌───────────────────────────────────┐  ┌────────────────────┐ │
│  │        FRONTEND (WebView)         │  │   BACKEND (Rust)   │ │
│  │                                   │  │                    │ │
│  │  React 19 + Vite + TypeScript     │  │  Tauri Commands    │ │
│  │  ┌─────────────────────────────┐  │  │  ┌──────────────┐ │ │
│  │  │      Zustand Store          │  │  │  │ add_project  │ │ │
│  │  │  ┌─────────┐ ┌──────────┐  │  │  │  │ get_info     │ │ │
│  │  │  │projects │ │ groups   │  │  │  │  │ detect_stack │ │ │
│  │  │  └─────────┘ └──────────┘  │  │  │  │ open_project │ │ │
│  │  └─────────────────────────────┘  │  │  │ git_status   │ │ │
│  │                                   │  │  └──────────────┘ │ │
│  │  ┌─────────────────────────────┐  │  │                    │ │
│  │  │     React Components        │  │  │  ┌──────────────┐ │ │
│  │  │  TopBar │ Filters │ Grid    │◄─┼──┤  │ Filesystem   │ │ │
│  │  │  ProjectCard │ GroupCard    │──┼──►  │ Git CLI      │ │ │
│  │  └─────────────────────────────┘  │  │  │ Shell/Exec   │ │ │
│  │                                   │  │  │ JSON Storage │ │ │
│  │  ┌─────────────────────────────┐  │  │  └──────────────┘ │ │
│  │  │     shadcn/ui + TailwindCSS │  │  │                    │ │
│  │  │     dnd-kit (drag & drop)   │  │  │                    │ │
│  │  └─────────────────────────────┘  │  │                    │ │
│  └───────────────────────────────────┘  └────────────────────┘ │
│                                                                 │
│              IPC (invoke / listen)                              │
│         Frontend ◄──────────────────► Backend                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Comunicación

### Frontend → Backend (Commands)

El frontend invoca **Tauri Commands** a través del bridge IPC:

```typescript
// Frontend: invocar un command de Rust
import { invoke } from '@tauri-apps/api/core';

const projectInfo = await invoke('get_project_info', { path: '/Users/me/project' });
```

```rust
// Backend: definir el command en Rust
#[tauri::command]
fn get_project_info(path: String) -> Result<ProjectInfo, String> {
    // Acceder al filesystem, ejecutar git, etc.
}
```

### Backend → Frontend (Events)

Para actualizaciones en tiempo real (e.g., watcher de cambios):

```rust
// Backend: emitir evento
app_handle.emit("git-status-changed", payload)?;
```

```typescript
// Frontend: escuchar evento
import { listen } from '@tauri-apps/api/event';

listen('git-status-changed', (event) => {
  // Actualizar el store
});
```

---

## 🧩 Capas del Sistema

### Capa 1: Presentación (React)

| Componente | Responsabilidad |
|-----------|-----------------|
| `TopBar` | Buscador, botón agregar, settings |
| `FilterChips` | Filtros de grupos con glow |
| `ProjectGrid` | Grid de cards con drag & drop |
| `ProjectCard` | Info del proyecto + estado git |
| `GroupCard` | Grupo con sus proyectos + Launch All |
| `AddProjectDialog` | Modal para agregar proyectos |
| `SettingsPanel` | Configuraciones de la app |

### Capa 2: Estado (Zustand)

| Store | Datos |
|-------|-------|
| `useProjectStore` | Lista de proyectos, CRUD, filtros |
| `useGroupStore` | Grupos, asignación de proyectos |
| `useUIStore` | Tema, buscador, estado de modales |

### Capa 3: Servicios (TypeScript → Tauri Bridge)

| Servicio | Función |
|----------|---------|
| `projectService` | Wrapper sobre invoke() para proyectos |
| `gitService` | Wrapper sobre invoke() para operaciones git |
| `systemService` | Wrapper sobre invoke() para abrir editores |

### Capa 4: Backend Nativo (Rust)

| Módulo | Función |
|--------|---------|
| `commands/project.rs` | Agregar/listar/eliminar proyectos |
| `commands/git.rs` | Ejecutar comandos git y parsear output |
| `commands/system.rs` | Abrir editores, ejecutar procesos |
| `commands/detect.rs` | Detectar stack tecnológico |
| `storage/` | Persistencia en JSON local |

---

## 📦 Proyectos Nx y sus Relaciones

```
                    ┌──────────────┐
                    │   dev-hub    │  (Tauri app - Rust)
                    │  apps/desktop│
                    └──────┬───────┘
                           │ embeds
                    ┌──────▼───────┐
                    │  dev-hub-ui  │  (React + Vite)
                    │ apps/dev-hub │
                    └──────┬───────┘
                           │ imports
              ┌────────────┼────────────┐
              │            │            │
      ┌───────▼──────┐ ┌──▼──────┐ ┌──▼──────────┐
      │   ui-kit     │ │ models  │ │  services   │
      │ libs/ui-kit  │ │libs/    │ │libs/services│
      │              │ │models   │ │             │
      └──────────────┘ └─────────┘ └─────────────┘
```

### Proyectos a Crear

| Proyecto Nx | Tipo | Path | Descripción |
|-------------|------|------|-------------|
| `dev-hub` | Application | `apps/desktop/` | App Tauri (Rust backend + shell) |
| `dev-hub-ui` | Application | `apps/dev-hub/` | Frontend React + Vite |
| `@org/models` | Library | `libs/models/` | Interfaces y tipos TypeScript compartidos |
| `@org/ui-kit` | Library | `libs/ui-kit/` | Componentes UI reutilizables (shadcn-based) |
| `@org/services` | Library | `libs/services/` | Servicios de comunicación con Tauri |

> [!IMPORTANT]
> La app de Tauri (`apps/desktop/`) NO es una app React separada. Es un wrapper que:
> 1. Contiene el código Rust en `src-tauri/`
> 2. Apunta al frontend React (`apps/dev-hub/`) como su WebView
> 3. Se compila como un binario nativo para macOS/Windows/Linux

---

## 🗄️ Persistencia

La app almacena datos localmente:

```
~/Library/Application Support/dev-hub/
├── projects.json          # Lista de proyectos registrados
├── groups.json            # Grupos y sus proyectos
└── settings.json          # Configuración del usuario
```

### Formato de `projects.json`

```json
[
  {
    "id": "uuid-1234",
    "name": "my-project",
    "path": "/Users/me/projects/my-project",
    "stack": ["react", "typescript", "vite"],
    "addedAt": "2026-03-21T00:00:00Z"
  }
]
```

> [!NOTE]
> El estado de git NO se persiste. Se consulta en tiempo real cada vez que se necesita, ya que cambia constantemente.
