# 8. Modelos de Datos

[← Volver al Índice](./README.md)

---

## 📦 Ubicación

Los tipos compartidos viven en `libs/models/src/` y son importados tanto por el frontend React como referenciados por los structs de Rust en el backend.

```
libs/models/src/
├── index.ts          # Re-exports
├── project.ts        # Project, GitStatus, Stack
└── group.ts          # Group, GroupConfig
```

---

## 🏷️ Interfaces TypeScript

### `Project`

```typescript
/**
 * Representa un proyecto local registrado en la aplicación.
 */
export interface Project {
  /** Identificador único (UUID v4) */
  id: string;

  /** Nombre del proyecto (normalmente el nombre de la carpeta) */
  name: string;

  /** Ruta absoluta al directorio del proyecto */
  path: string;

  /** Stack tecnológico detectado */
  stack: StackType[];

  /** Información de Git */
  git: GitInfo;

  /** ISO timestamp de cuándo se registró */
  addedAt: string;
}
```

### `GitInfo`

```typescript
/**
 * Información del estado de Git de un proyecto.
 */
export interface GitInfo {
  /** Branch actual (e.g. "main", "feature/login") */
  branch: string;

  /** Mensaje del último commit */
  lastCommit: string;

  /** Estado del repositorio */
  status: GitStatusType;

  /** Cantidad de archivos modificados (si uncommitted) */
  changesCount: number;
}
```

### `GitStatusType`

```typescript
/**
 * Estado del repositorio Git.
 * Determina el color del glow en la UI.
 */
export type GitStatusType = 'clean' | 'uncommitted' | 'unpushed';
```

### `StackType`

```typescript
/**
 * Tecnologías detectables por el sistema.
 */
export type StackType =
  | 'react'
  | 'angular'
  | 'vue'
  | 'nextjs'
  | 'nuxt'
  | 'svelte'
  | 'node'
  | 'express'
  | 'nestjs'
  | 'python'
  | 'django'
  | 'flask'
  | 'fastapi'
  | 'rust'
  | 'go'
  | 'java'
  | 'kotlin'
  | 'ruby'
  | 'rails'
  | 'typescript'
  | 'javascript'
  | 'docker'
  | 'kubernetes'
  | 'terraform'
  | 'flutter'
  | 'dart'
  | 'swift'
  | 'nx'
  | 'vite'
  | 'webpack'
  | 'tailwindcss'
  | 'graphql'
  | 'mongodb'
  | 'postgresql'
  | 'redis';
```

### `Group`

```typescript
/**
 * Un grupo de proyectos que se pueden lanzar juntos.
 */
export interface Group {
  /** Identificador único (UUID v4) */
  id: string;

  /** Nombre del grupo (e.g. "Trabajo", "Side Projects") */
  name: string;

  /** IDs de los proyectos en este grupo */
  projectIds: string[];

  /** Color del grupo (para chips de filtro) */
  color?: string;
}
```

### `AppSettings`

```typescript
/**
 * Configuración de la aplicación.
 */
export interface AppSettings {
  /** Editor preferido por defecto */
  defaultEditor: EditorType;

  /** Intervalo de polling de git en segundos */
  gitPollInterval: number;

  /** Delay en ms entre aperturas en Launch All */
  launchDelay: number;

  /** Orden de las cards */
  sortBy: SortField;

  /** Dirección del orden */
  sortDirection: 'asc' | 'desc';
}
```

### `EditorType`

```typescript
export type EditorType =
  | 'vscode'
  | 'cursor'
  | 'zed'
  | 'webstorm'
  | 'sublime'
  | 'neovim';
```

### `SortField`

```typescript
export type SortField = 'name' | 'addedAt' | 'lastCommit' | 'status';
```

---

## 🔄 Mapeo TypeScript ↔ Rust

| TypeScript | Rust | Nota |
|-----------|------|------|
| `Project` | `Project` | Campos en camelCase (TS) ↔ snake_case (Rust) |
| `GitInfo` | `GitInfo` | Serde `#[serde(rename_all = "camelCase")]` |
| `GitStatusType` | `GitStatusType` (enum) | Serde `#[serde(rename_all = "lowercase")]` |
| `Group` | `Group` | Idéntico con rename |
| `string[]` | `Vec<String>` | Arrays ↔ Vectors |

### Serde Rename

```rust
// En Rust, usar rename_all para match con camelCase de TypeScript
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    pub stack: Vec<String>,
    pub git: GitInfo,
    pub added_at: String,  // Se serializa como "addedAt"
}
```

---

## 📝 Contratos de los Commands

### Request/Response de cada Tauri Command

| Command | Input | Output |
|---------|-------|--------|
| `add_project` | `{ path: string }` | `Project` |
| `remove_project` | `{ id: string }` | `void` |
| `list_projects` | – | `Project[]` |
| `get_project_info` | `{ path: string }` | `ProjectInfo` |
| `get_git_status` | `{ path: string }` | `GitInfo` |
| `detect_stack` | `{ path: string }` | `StackType[]` |
| `open_project` | `{ path: string, editor: string }` | `void` |
| `save_groups` | `{ groups: Group[] }` | `void` |
| `load_groups` | – | `Group[]` |
| `save_settings` | `{ settings: AppSettings }` | `void` |
| `load_settings` | – | `AppSettings` |

---

## ⚠️ Reglas de Modelos

1. **Un solo lugar**: Todos los tipos compartidos entre frontend/backend viven en `libs/models`
2. **No duplicar**: Los componentes React importan de `@org/models`, nunca definen tipos inline
3. **Serde compatible**: Los nombres de campos en TypeScript (camelCase) deben matchear con Rust vía `serde(rename_all = "camelCase")`
4. **Validación en Rust**: Los tipos no tienen validación en TypeScript — el backend valida y retorna errores claros
5. **Extensible**: Usar `type` unions en lugar de enums de TypeScript para compatibilidad con Serde
