# 10. Convenciones y Reglas

[← Volver al Índice](./README.md)

---

## 📛 Naming Conventions

### Archivos y Carpetas

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `ProjectCard.tsx` |
| Hooks | camelCase con `use` prefix | `useProjectStore.ts` |
| Servicios | camelCase con `Service` suffix | `projectService.ts` |
| Tipos/Interfaces | camelCase | `project.ts` |
| Carpetas | kebab-case | `project-grid/` |
| CSS modules | kebab-case | `project-card.module.css` |
| Archivos Rust | snake_case | `git_commands.rs` |
| Módulos Rust | snake_case | `mod json_store;` |

### Variables y Funciones

| Lenguaje | Convención | Ejemplo |
|----------|-----------|---------|
| TypeScript variables | camelCase | `const projectList` |
| TypeScript types/interfaces | PascalCase | `interface Project` |
| TypeScript enums/unions | PascalCase con valores lowercase | `type GitStatusType = 'clean'` |
| Rust variables | snake_case | `let project_list` |
| Rust structs | PascalCase | `struct Project` |
| Rust functions | snake_case | `fn get_git_status()` |
| CSS variables | kebab-case con `--` prefix | `--neon-green` |
| Tailwind custom | kebab-case | `glass-card` |

### Proyectos Nx

| Tipo | Prefijo | Ejemplo |
|------|---------|---------|
| Apps | (sin prefijo) | `dev-hub`, `dev-hub-ui` |
| Libs compartidas | `@org/` | `@org/models`, `@org/ui-kit` |
| E2E | sufijo `-e2e` | `dev-hub-e2e` |

---

## 📁 Estructura de Componentes React

### Componente simple

```
components/
└── GlassCard.tsx            # Componente + tipos inline
```

### Componente complejo (con sub-componentes)

```
components/
└── ProjectCard/
    ├── ProjectCard.tsx       # Componente principal
    ├── ProjectCardActions.tsx # Sub-componente
    ├── ProjectCardStatus.tsx  # Sub-componente
    ├── ProjectCard.test.tsx   # Tests
    └── index.ts              # Re-export
```

### Patrón de componente

```typescript
// ProjectCard.tsx
import { type FC } from 'react';
import type { Project } from '@org/models';

interface ProjectCardProps {
  project: Project;
  onOpen: (id: string) => void;
  className?: string;
}

export const ProjectCard: FC<ProjectCardProps> = ({ 
  project, 
  onOpen, 
  className 
}) => {
  return (
    <div className={`glass-card ${className ?? ''}`}>
      {/* ... */}
    </div>
  );
};
```

---

## 🧠 Patrones de Estado (Zustand)

### Estructura de un store

```typescript
import { create } from 'zustand';

interface ProjectState {
  // State
  projects: Project[];
  isLoading: boolean;
  
  // Actions (siempre funciones, nunca setters directos)
  loadProjects: () => Promise<void>;
  addProject: (path: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  isLoading: false,

  // Actions
  loadProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await projectService.listProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to load projects:', error);
    }
  },

  addProject: async (path) => {
    const project = await projectService.addProject(path);
    set((state) => ({ 
      projects: [...state.projects, project] 
    }));
  },
}));
```

### Reglas de stores

1. **Un store por dominio**: projects, groups, ui
2. **Acciones async** usan try/catch y manejan loading state
3. **Nunca set() directos** desde componentes — siempre a través de acciones
4. **Selectores** para datos derivados:

```typescript
// En el componente
const filteredProjects = useProjectStore(
  (state) => state.projects.filter(p => p.name.includes(searchQuery))
);
```

---

## 🔌 Patrones de Servicios

### Estructura

```typescript
// services/projectService.ts
import { invoke } from '@tauri-apps/api/core';
import type { Project } from '@org/models';

const IS_TAURI = typeof window !== 'undefined' && '__TAURI__' in window;

export const projectService = {
  async listProjects(): Promise<Project[]> {
    if (!IS_TAURI) {
      // Mock data para desarrollo sin Tauri
      return import('./mocks/projects').then(m => m.mockProjects);
    }
    return invoke<Project[]>('list_projects');
  },
};
```

### Reglas de servicios

1. **Una función por comando Tauri**
2. **Siempre tipar** el retorno de `invoke<T>()`
3. **Detectar entorno** con `IS_TAURI` para fallback a mocks
4. **Nunca llamar `invoke()` directamente** desde componentes

---

## 🦀 Patrones de Rust/Tauri

### Commands

```rust
// Siempre retornar Result<T, String>
#[tauri::command]
fn my_command(param: String) -> Result<MyStruct, String> {
    // Usar .map_err(|e| e.to_string()) para convertir errores
    let result = do_something(&param)
        .map_err(|e| format!("Failed to do something: {}", e))?;
    
    Ok(result)
}
```

### Registro de Commands

```rust
// lib.rs
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::project::add_project,
            commands::project::list_projects,
            commands::project::remove_project,
            commands::git::get_git_status,
            commands::detect::detect_stack,
            commands::system::open_project,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 🔀 Git Conventions

### Branches

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Feature | `feature/<descripción>` | `feature/project-cards` |
| Fix | `fix/<descripción>` | `fix/git-status-parsing` |
| Chore | `chore/<descripción>` | `chore/update-deps` |
| Refactor | `refactor/<descripción>` | `refactor/store-structure` |

### Commits (Conventional Commits)

```
<type>(<scope>): <descripción>

Tipos: feat, fix, chore, docs, refactor, test, style, perf
Scopes: ui, backend, models, services, config
```

Ejemplos:
```
feat(ui): add ProjectCard component with neon glow
fix(backend): handle missing .git directory
chore(config): update tauri.conf.json permissions
docs(models): add JSDoc to Project interface
refactor(services): extract mock data to separate files
```

---

## 📋 Checklist para AI Editors

Antes de hacer cambios, verifica:

- [ ] ¿Los tipos nuevos/modificados están en `libs/models`?
- [ ] ¿Los componentes UI reutilizables están en `libs/ui-kit`?
- [ ] ¿Los servicios pasan por el bridge de Tauri (no invoke directo)?
- [ ] ¿El store sigue el patrón Zustand establecido?
- [ ] ¿Los componentes usan las variables CSS del tema neon?
- [ ] ¿Los Rust commands retornan `Result<T, String>`?
- [ ] ¿Se usan `#[serde(rename_all = "camelCase")]` en los structs?
- [ ] ¿Los commands están registrados en `lib.rs`?
- [ ] ¿La funcionalidad nueva tiene mock data para desarrollo standalone?
- [ ] ¿Se siguen las naming conventions?

---

## 🚫 Prohibiciones

| ❌ NUNCA | ✅ EN SU LUGAR |
|---------|---------------|
| `invoke()` directo en componentes | Usar servicios en `services/` |
| Definir tipos en archivos de componentes | Importar de `@org/models` |
| `useState` para estado global | Usar stores Zustand |
| Colores hardcodeados en componentes | Usar variables CSS (`var(--neon-green)`) |
| `any` en TypeScript | Tipar correctamente todo |
| `unwrap()` en Rust sin razón | Usar `?` operator con `Result` |
| Instalar paquetes globalmente | Usar `bun add` en la raíz del repo |
| Modificar `node_modules` | Nunca tocar |
| Commits directos a `main` | Usar branches + PR |
