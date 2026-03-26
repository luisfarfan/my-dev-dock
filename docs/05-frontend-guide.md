# 5. Guía del Frontend (React)

[← Volver al Índice](./README.md)

---

## 📁 Estructura del Frontend

Raíz del frontend: `src/` (Vite + React).

```
src/
├── main.tsx                 # Entry, monta React
├── app/
│   ├── app.tsx              # Shell de la app
│   ├── layouts/             # Layout compartido (ej. MainLayout)
│   ├── pages/               # Páginas / contenedores de ruta (ej. DashboardPage)
│   ├── features/            # Dominios verticales (feature-based)
│   │   ├── projects/
│   │   │   ├── index.ts     # Barrel público del feature
│   │   │   └── components/
│   │   ├── groups/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   └── dashboard/
│   │       ├── index.ts
│   │       ├── components/
│   │       └── hooks/
│   ├── shared/              # Utilidades y constantes solo de la app (no ui-kit)
│   │   ├── constants/
│   │   └── utils/
│   └── store/               # Zustand (ej. use-project-store)
└── lib/                     # UI kit, models, services (@org/*)
```

### Alias de importación

-   `@/*` → `src/*` (configurado en `tsconfig.json` y `vite.config.ts`).
-   Ejemplos: `@/app/features/projects`, `@/app/shared/utils/is-tauri-runtime`.
-   Paquetes internos estables: `@org/models`, `@org/ui-kit`, `@org/services`.

### Barrels por feature (`index.ts`)

Cada carpeta bajo `src/app/features/<nombre>/` expone su API pública desde **`index.ts`**:

-   Importa desde el barrel cuando consumas el feature desde fuera (páginas, otros features):  
    `import { ProjectCard } from '@/app/features/projects'`.
-   Dentro del mismo feature, los archivos en `components/` pueden importarse entre sí con rutas relativas o, si prefieres consistencia, también vía `@/app/features/<feature>`.
-   **No** reexportar en el barrel helpers internos que solo usa un submódulo; mantén el barrel acotado a lo que otros módulos necesitan.

Features actuales:

| Feature     | Barrel                         | Exporta principalmente        |
|------------|--------------------------------|-------------------------------|
| `projects` | `@/app/features/projects`     | `ProjectCard`                 |
| `groups`   | `@/app/features/groups`       | `GroupSpace`                  |
| `dashboard`| `@/app/features/dashboard`    | `useDashboard`, piezas de UI del hub |

## 🏗️ Senior Architecture (Feature-Based)

La aplicación sigue un patrón de **Separación de Capas** y **Feature-Based Architecture** para escalar de forma mantenible:

### Directorios Clave (`src/app/`)

-   `layouts/`: Esqueleto visual compartido (SideNav, Header, fondo neón).
-   `pages/`: Contenedores de alto nivel que representan rutas completas.
-   `features/`: Lógica vertical por dominio (proyectos, grupos, dashboard).
    -   `components/`: Componentes específicos de esa funcionalidad.
    -   `hooks/`: Lógica de estado y efectos extraída en ganchos personalizados.
    -   `index.ts`: API pública del feature (barrel).
-   `shared/`: Constantes y utilidades de app que no son un “feature” ni `ui-kit`.
-   `store/`: Estado global persistente (Zustand).
-   `src/lib/`: Componentes reutilizables neon/glass y servicios (`@org/*`).

### Principios de Seniority React
-   **Composition**: Se prefiere el uso de `children` y slots para evitar el "prop drilling".
-   **Custom Hooks**: Toda la lógica de fetching y manipulación de datos vive en hooks (ej: `useDashboard`).
-   **Atomic UI**: Los componentes visuales puros viven en `libs/ui-kit`.
-   **Single Responsibility (SRP)**: Cada componente tiene un único propósito (ej: `ProjectCard` solo muestra la card).

---

## 🧠 Estado Global (Zustand Stores)

### `useProjectStore`

```typescript
interface ProjectStore {
  // State
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  addProject: (path: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  refreshProject: (id: string) => Promise<void>;
  refreshAllGitStatus: () => Promise<void>;
}
```

### `useGroupStore`

```typescript
interface GroupStore {
  // State
  groups: Group[];
  activeGroupId: string | null;  // Filtro activo

  // Actions
  loadGroups: () => Promise<void>;
  createGroup: (name: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addProjectToGroup: (groupId: string, projectId: string) => void;
  removeProjectFromGroup: (groupId: string, projectId: string) => void;
  setActiveGroup: (groupId: string | null) => void;
  launchAll: (groupId: string, delayMs?: number) => Promise<void>;
}
```

### `useUIStore`

```typescript
interface UIStore {
  // State
  searchQuery: string;
  isAddDialogOpen: boolean;
  isSettingsOpen: boolean;
  viewMode: 'grid' | 'list';

  // Actions
  setSearchQuery: (query: string) => void;
  toggleAddDialog: () => void;
  toggleSettings: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}
```

---

## 🔌 Servicios (Tauri Bridge)

Todos los servicios usan `invoke()` de `@tauri-apps/api/core` para comunicarse con el backend Rust.

### `projectService.ts`

```typescript
import { invoke } from '@tauri-apps/api/core';

export const projectService = {
  async addProject(path: string): Promise<Project> {
    return invoke('add_project', { path });
  },

  async getProjectInfo(path: string): Promise<ProjectInfo> {
    return invoke('get_project_info', { path });
  },

  async listProjects(): Promise<Project[]> {
    return invoke('list_projects');
  },

  async removeProject(id: string): Promise<void> {
    return invoke('remove_project', { id });
  }
};
```

### `gitService.ts`

```typescript
export const gitService = {
  async getGitStatus(path: string): Promise<GitStatus> {
    return invoke('get_git_status', { path });
  },

  async getBranch(path: string): Promise<string> {
    return invoke('get_branch', { path });
  },

  async getLastCommit(path: string): Promise<string> {
    return invoke('get_last_commit', { path });
  }
};
```

### `systemService.ts`

```typescript
export const systemService = {
  async openInEditor(path: string, editor: string): Promise<void> {
    return invoke('open_project', { path, editor });
  },

  async openInTerminal(path: string): Promise<void> {
    return invoke('open_terminal', { path });
  }
};
```

---

## 🧩 Componentes Clave

### `ProjectCard`

```
┌─────────────────────────────────────────┐
│  ┌────┐  my-awesome-project          ⋮ │  ← Nombre + menú contextual
│  │ ⚛️  │  ~/projects/my-awesome-proj    │  ← Path acortado
│  └────┘  React • TypeScript • Vite      │  ← Stack detectado
│                                         │
│  🔀 main  │  📝 "fix: login bug"       │  ← Branch + último commit
│                                         │
│  ● Clean                                │  ← Estado git con glow
│                                         │
│  [Abrir en VS Code]  [Abrir en Cursor] │  ← Acciones rápidas
└─────────────────────────────────────────┘
```

**Props:**
```typescript
interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string, editor: string) => void;
  onRemove: (projectId: string) => void;
  onRefresh: (projectId: string) => void;
}
```

### `GroupCard`

```
┌─────────────────────────────────────────┐
│  📁 Trabajo                      ⚡     │  ← Nombre + Launch All
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │ P1  │ │ P2  │ │ P3  │ ← Mini cards │  ← Proyectos del grupo
│  └─────┘ └─────┘ └─────┘              │
│                                         │
│  3 proyectos  •  Delay: 2s             │  ← Info + config
└─────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Datos

```
1. App mounts
   └─► useProjectStore.loadProjects()
       └─► projectService.listProjects()
           └─► invoke('list_projects')
               └─► Rust: lee projects.json
                   └─► Retorna Project[]
                       └─► Store actualizado
                           └─► UI se re-renderiza

2. Para cada proyecto visible:
   └─► useGitPolling (cada 30s)
       └─► gitService.getGitStatus(path)
           └─► invoke('get_git_status')
               └─► Rust: ejecuta git status
                   └─► Retorna GitStatus
                       └─► Store actualizado
                           └─► Card glow cambia
```

---

## 🧪 Estrategia de Mocking

> [!TIP]
> Según el PROMPT.IA, primero se construye **la UI completa con datos mock**, y luego se reemplazan los mocks con llamadas reales a Tauri.

### Patrón de mock:

```typescript
// services/projectService.ts
const IS_MOCK = !window.__TAURI__;  // Detecta si estamos en navegador

export const projectService = {
  async listProjects(): Promise<Project[]> {
    if (IS_MOCK) return mockProjects;
    return invoke('list_projects');
  }
};
```

### Mock data de ejemplo:

```typescript
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'dev-hub',
    path: '/Users/me/projects/dev-hub',
    stack: ['react', 'typescript', 'vite', 'tauri'],
    git: {
      branch: 'main',
      lastCommit: 'feat: add project cards',
      status: 'clean'
    }
  },
  {
    id: '2',
    name: 'api-gateway',
    path: '/Users/me/projects/api-gateway',
    stack: ['node', 'typescript', 'express'],
    git: {
      branch: 'feature/auth',
      lastCommit: 'wip: jwt middleware',
      status: 'uncommitted'
    }
  }
];
```

---

## ⚠️ Reglas del Frontend

1. **Nunca acceder al filesystem directamente** — siempre a través de Tauri commands
2. **No usar `useState` para estado compartido** — usar stores Zustand
3. **Componentes UI reutilizables** van en `libs/ui-kit`, no en el app
4. **Tipos compartidos** van en `libs/models`, no duplicados en el frontend
5. **Servicios son la única capa** que habla con Tauri (no invoke() en componentes)
6. **Todo componente** debe soportar el tema neon/glass (usar variables CSS)
