# 6. Guía del Backend (Tauri / Rust)

[← Volver al Índice](./README.md)

---

> **Estado actual del código**: la implementación vive en un solo archivo, [`src-tauri/src/lib.rs`](../../src-tauri/src/lib.rs). Los ejemplos más abajo son **ilustrativos**; la lista real de `#[tauri::command]` y la lógica de **escaneo workspace-aware** están en ese archivo y en [**00-ai-brief.md**](./00-ai-brief.md).

---

## 📁 Estructura del Backend

```
apps/desktop/src-tauri/
├── src/
│   ├── main.rs                 # Entry point (generado por Tauri)
│   ├── lib.rs                  # Registro de commands y plugins
│   ├── commands/               # Tauri Commands (API para el frontend)
│   │   ├── mod.rs              # Re-exports
│   │   ├── project.rs          # CRUD de proyectos
│   │   ├── git.rs              # Operaciones Git
│   │   ├── detect.rs           # Detección de stack tecnológico
│   │   └── system.rs           # Abrir editores, ejecutar procesos
│   ├── storage/                # Capa de persistencia
│   │   ├── mod.rs
│   │   └── json_store.rs       # Lectura/escritura de JSON
│   └── models/                 # Structs de datos
│       ├── mod.rs
│       └── project.rs          # Project, GitStatus, Stack
├── Cargo.toml                  # Dependencias Rust
├── tauri.conf.json             # Config de Tauri (permisos, ventana, etc.)
├── build.rs                    # Build script
└── icons/                      # Íconos de la app desktop
```

---

## 🔧 Tauri Commands

### 1. `add_project(path: String) -> Result<Project, String>`

Registra un nuevo proyecto local.

**Lógica:**
1. Verificar que `path` existe y es un directorio
2. Leer nombre del directorio (o de `package.json` si existe)
3. Detectar stack tecnológico
4. Obtener estado git inicial
5. Guardar en `projects.json`
6. Retornar `Project` completo

```rust
#[tauri::command]
fn add_project(path: String) -> Result<Project, String> {
    let path = PathBuf::from(&path);
    if !path.exists() || !path.is_dir() {
        return Err("Path does not exist or is not a directory".into());
    }

    let name = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    let stack = detect_stack_internal(&path)?;
    let git = get_git_status_internal(&path)?;

    let project = Project {
        id: Uuid::new_v4().to_string(),
        name,
        path: path.to_string_lossy().to_string(),
        stack,
        git,
        added_at: chrono::Utc::now().to_rfc3339(),
    };

    storage::save_project(&project)?;
    Ok(project)
}
```

---

### 2. `get_project_info(path: String) -> Result<ProjectInfo, String>`

Obtiene información actualizada de un proyecto.

**Ejecuta los siguientes comandos:**

| Comando Git | Información |
|-------------|-------------|
| `git rev-parse --abbrev-ref HEAD` | Branch actual |
| `git log -1 --pretty=%B` | Mensaje del último commit |
| `git status --porcelain` | Cambios sin commitear |
| `git status` (parsear "ahead") | Commits sin pushear |

**Detección de estado:**

```rust
fn determine_git_status(porcelain: &str, status_full: &str) -> GitStatusType {
    if !porcelain.is_empty() {
        GitStatusType::Uncommitted  // Hay cambios sin commitear
    } else if status_full.contains("ahead") {
        GitStatusType::Unpushed     // Hay commits sin pushear
    } else {
        GitStatusType::Clean        // Todo limpio
    }
}
```

---

### 3. `detect_stack(path: String) -> Result<Vec<String>, String>`

Lee archivos de configuración para determinar el stack tecnológico.

**Archivos que busca:**

| Archivo | Stack detectado |
|---------|----------------|
| `package.json` → `react` en deps | React |
| `package.json` → `@angular/core` en deps | Angular |
| `package.json` → `vue` en deps | Vue |
| `package.json` → `next` en deps | Next.js |
| `package.json` → `express` en deps | Express |
| `angular.json` | Angular |
| `src-tauri/tauri.conf.json` | Tauri (este proyecto) |
| `requirements.txt` | Python |
| `pyproject.toml` | Python |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `pom.xml` | Java/Maven |
| `build.gradle` | Gradle |
| `Gemfile` | Ruby |
| `tsconfig.json` | TypeScript |
| `docker-compose.yml` | Docker |
| `.flutter` / `pubspec.yaml` | Flutter/Dart |

---

### 4. `open_project(path: String, editor: String) -> Result<(), String>`

Abre un proyecto en el editor especificado.

**Editores soportados:**

| Editor | Comando |
|--------|---------|
| VS Code | `code <path>` |
| Cursor | `cursor <path>` |
| Zed | `zed <path>` |
| WebStorm | `webstorm <path>` |
| Sublime Text | `subl <path>` |
| Terminal | `open -a Terminal <path>` (macOS) |

```rust
#[tauri::command]
fn open_project(path: String, editor: String) -> Result<(), String> {
    let cmd = match editor.as_str() {
        "vscode" => "code",
        "cursor" => "cursor",
        "zed" => "zed",
        "webstorm" => "webstorm",
        "sublime" => "subl",
        _ => return Err(format!("Unknown editor: {}", editor)),
    };

    Command::new(cmd)
        .arg(&path)
        .spawn()
        .map_err(|e| format!("Failed to open editor: {}", e))?;

    Ok(())
}
```

---

### 5. `list_projects() -> Result<Vec<Project>, String>`

Lista todos los proyectos registrados.

### 6. `remove_project(id: String) -> Result<(), String>`

Elimina un proyecto del registro (no del filesystem).

### 7. `save_groups(groups: Vec<Group>) -> Result<(), String>`

Guarda la configuración de grupos.

### 8. `load_groups() -> Result<Vec<Group>, String>`

Carga los grupos guardados.

---

## 📦 Structs de Rust

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    pub stack: Vec<String>,
    pub git: GitInfo,
    pub added_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitInfo {
    pub branch: String,
    pub last_commit: String,
    pub status: GitStatusType,
    pub changes_count: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum GitStatusType {
    Clean,
    Uncommitted,
    Unpushed,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Group {
    pub id: String,
    pub name: String,
    pub project_ids: Vec<String>,
}
```

---

## 🗄️ Persistencia (Storage)

### Ubicación de datos

```rust
use dirs::config_dir;

fn get_data_dir() -> PathBuf {
    let mut path = config_dir().expect("No config directory found");
    path.push("dev-hub");
    std::fs::create_dir_all(&path).ok();
    path
}
```

Platform paths:
- **macOS**: `~/Library/Application Support/dev-hub/`
- **Linux**: `~/.config/dev-hub/`
- **Windows**: `C:\Users\<user>\AppData\Roaming\dev-hub\`

### Archivos de datos

| Archivo | Contenido |
|---------|-----------|
| `projects.json` | `Vec<Project>` serializado |
| `groups.json` | `Vec<Group>` serializado |
| `settings.json` | Configuración del usuario |

---

## ⚙️ Configuración de Tauri (`tauri.conf.json`)

```json
{
  "productName": "Developer Project Hub",
  "version": "0.1.0",
  "identifier": "com.devhub.app",
  "build": {
    "frontendDist": "../dev-hub/dist",
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "",
    "beforeBuildCommand": ""
  },
  "app": {
    "windows": [
      {
        "title": "Developer Project Hub",
        "width": 1280,
        "height": 800,
        "resizable": true,
        "decorations": true,
        "transparent": false
      }
    ],
    "security": {
      "csp": null
    }
  }
}
```

> [!IMPORTANT]
> El campo `frontendDist` apunta al build output del frontend React (`apps/dev-hub/dist`). En desarrollo, `devUrl` apunta al dev server de Vite.

---

## ⚠️ Reglas del Backend

1. **Todos los commands** deben retornar `Result<T, String>` para manejo de errores
2. **Nunca hardcodear rutas** — usar `dirs` crate para paths del sistema
3. **Los commands deben ser `async`** cuando ejecutan procesos o I/O pesado
4. **Serialización** con `serde` — todos los structs deben derivar `Serialize`/`Deserialize`
5. **Los commands se registran** en `lib.rs` con `.invoke_handler(tauri::generate_handler![...])`
6. **Permisos** deben estar declarados en `capabilities/` para Tauri v2
