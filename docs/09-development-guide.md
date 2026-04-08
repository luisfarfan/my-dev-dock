# 9. Guía de Desarrollo

[← Volver al Índice](./README.md)

> Este proyecto es un **repo Tauri único** (React + Vite en la raíz, Rust en `src-tauri/`). Usa **Bun** como gestor de paquetes.

---

## 🚀 Prerrequisitos

| Herramienta | Versión mínima | Instalación |
|------------|---------------|-------------|
| **Bun** | 1.x | [bun.sh](https://bun.sh) |
| **Node.js** | 20.x (compatible con Bun) | [nodejs.org](https://nodejs.org) |
| **Rust** | stable | [rustup.rs](https://rustup.rs) |
| **Tauri CLI** | 2.x | `bun run tauri` (vía `@tauri-apps/cli`) o `cargo install tauri-cli` |

### Verificar instalación

```bash
bun --version
rustc --version
```

---

## 📦 Setup Inicial

```bash
git clone <url> dev-hub-tauri
cd dev-hub-tauri

bun install
rustup update stable
```

---

## 🏃 Desarrollo

### Frontend (Vite solamente)

Útil para UI rápida; los servicios usan **mocks** cuando no hay `window.__TAURI__`.

```bash
bun run dev
```

(Puerto por defecto del proyecto: **1420**, alineado con Tauri.)

### App Tauri (frontend + Rust)

```bash
bun run tauri dev
```

### Solo backend Rust

```bash
cd src-tauri
cargo check
cargo build
cargo test
```

---

## 🧪 Testing

- **Frontend**: añade Vitest/Jest en el repo si lo necesitas; hoy el `package.json` no define `test` por defecto.
- **Rust**:

```bash
cd src-tauri
cargo test
```

---

## 🔨 Build de Producción

### Solo frontend (web build)

```bash
bun run build
```

### App empaquetada (Tauri)

```bash
bun run tauri build
```

Los artefactos suelen quedar bajo `src-tauri/target/release/bundle/` (según plataforma y `tauri.conf.json`).

---

## 📁 Nuevos componentes y código compartido

- **Pantallas / features**: `src/app/`
- **Tipos**: `src/lib/models.ts` (`@org/models`)
- **Componentes reutilizables (neon/glass)**: `src/lib/` y exportarlos desde `src/lib/ui-kit/index.ts` (`@org/ui-kit`)
- **Servicios Tauri / mock**: `src/lib/services/` (`@org/services`)

No hay generadores Nx: crea archivos a mano siguiendo la estructura existente.

---

## 🐛 Debugging

### Frontend (React)

- En Tauri: inspeccionar WebView (menú contextual → Inspect).
- Errores de `invoke()` en consola del DevTools.

### Backend (Rust)

- `println!()`, `dbg!()`, o `RUST_LOG=debug`.
- Registrar cada `#[tauri::command]` en `src-tauri/src/lib.rs`.

---

## 📋 Workflow típico

1. Tipos en `src/lib/models.ts`.
2. UI en `src/app/`; piezas reutilizables en `src/lib/`.
3. Lógica Tauri en `src/lib/services/tauri.ts`; mocks en `mock.ts`.
4. Comandos Rust en `src-tauri/src/`, registrados en `lib.rs`.
5. Probar: `bun run dev` (mock) y `bun run tauri dev` (integración).

---

## Versionado y releases (Conventional Commits)

El repo usa **[semantic-release](https://github.com/semantic-release/semantic-release)** en GitHub Actions (`.github/workflows/release.yml`) para calcular la próxima versión **SemVer** a partir del historial de commits en `master`.

### Formato de mensajes

| Prefijo / cuerpo | Bump típico |
|------------------|-------------|
| `fix: …` | *patch* |
| `feat: …` | *minor* |
| `BREAKING CHANGE:` en el cuerpo, o `feat!:` / `fix!:` | *major* |

Ejemplos: `fix: correct group launch persistence`, `feat: add Raycast script cleanup`.

### Qué ocurre al hacer push a `master`

1. **Semantic release**: actualiza `CHANGELOG.md`, sincroniza la versión en `package.json`, `src-tauri/tauri.conf.json` y `src-tauri/Cargo.toml` (vía `scripts/sync-version.mjs`), crea el tag `vX.Y.Z` y publica la **GitHub Release** con notas.
2. El commit de release incluye `[skip ci]` para no relanzar el workflow de versionado en bucle.
3. **Tauri build** (`.github/workflows/tauri-artifacts.yml`): si hubo bump de versión, el workflow de semantic-release dispara este job con `gh workflow run` (tag `vX.Y.Z`). Se compila en macOS, Linux y Windows y se suben los instaladores al mismo release (puede tardar varios minutos). Recuperación manual: Actions → *Tauri build and release assets* → Run workflow → indicar el tag.

### Local

- Sincronizar versión manualmente (poco habitual): `bun run sync-version -- 0.2.0` (requiere argumento SemVer).
- Probar release en seco (requiere `GITHUB_TOKEN`): `bunx semantic-release --dry-run`.

---

## ⚠️ Problemas comunes

| Problema | Solución |
|----------|----------|
| `cargo build` falla | `rustup update && cd src-tauri && cargo update` |
| Error de serialización en IPC | `serde(rename_all = "camelCase")` en Rust y tipos alineados en TS |
| Hot reload en Tauri | Revisar `build.devUrl` / puerto en `tauri.conf.json` y `vite.config.ts` |
| Permisos Tauri v2 | Capabilities en `src-tauri/capabilities/` |
