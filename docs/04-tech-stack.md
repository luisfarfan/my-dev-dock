# 4. Stack Tecnológico

[← Volver al Índice](./README.md)

---

## 🛠️ Stack Completo

### Core

| Tecnología | Versión | Propósito | Docs |
|-----------|---------|-----------|------|
| **Tauri** | v2.x | Framework desktop (Rust backend + WebView) | [tauri.app](https://v2.tauri.app) |
| **React** | 19.x | UI library (frontend) | [react.dev](https://react.dev) |
| **Vite** | 6.x | Bundler y dev server | [vite.dev](https://vite.dev) |
| **TypeScript** | ~5.6 | Tipado estático | [typescriptlang.org](https://typescriptlang.org) |
| **Rust** | stable | Backend nativo de Tauri | [rust-lang.org](https://rust-lang.org) |

### UI & Estilos

| Tecnología | Propósito |
|-----------|-----------|
| **TailwindCSS** | Utility-first CSS framework |
| **shadcn/ui** | Componentes UI accesibles y personalizables |
| **CSS Variables** | Tema neon/glass personalizado |

### Estado & Interacción

| Tecnología | Propósito |
|-----------|-----------|
| **Zustand** | Estado global ligero y simple |
| **dnd-kit** | Drag & Drop para reordenar/agrupar proyectos |

### Tooling (este repo)

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Bun** | 1.x | Gestor de paquetes y `bun run` para scripts |
| **Vite** | 6.x | Bundler y dev server (frontend en la raíz) |
| **ESLint / Prettier / Vitest / Playwright** | — | Opcionales; no están forzados en el `package.json` mínimo actual |

---

## 🦀 Dependencias Rust (Cargo.toml)

```toml
[dependencies]
tauri = { version = "2", features = ["shell-open"] }
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
dirs = "5"                    # Para obtener rutas del sistema
walkdir = "2"                 # Para escanear directorios
```

---

## ⚛️ Dependencias JavaScript Key

### Frontend (raíz del repo)

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "zustand": "^5.0.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "typescript": "~5.9.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

---

## 📝 ¿Por qué cada tecnología?

| Decisión | Razón |
|----------|-------|
| **Tauri** sobre Electron | Más ligero (~10MB vs ~150MB), más rápido, acceso nativo vía Rust |
| **React** | Ecosistema maduro, compatible con Tauri v2, amplia comunidad |
| **Zustand** sobre Redux | Mínimo boilerplate, API simple, perfecto para apps medianas |
| **shadcn/ui** | Componentes copiados al proyecto (no dependency lock), totalmente customizables |
| **TailwindCSS** | Rapid UI development, perfecto para temas custom con CSS vars |
| **dnd-kit** | La alternativa más moderna y accesible para D&D en React |
| **Bun** | Instalación y scripts rápidos; lockfile `bun.lock` |
| **Repo Tauri único** | Sin Nx: Vite en raíz, Rust en `src-tauri/` |

---

## ⚠️ Notas Importantes

> [!IMPORTANT]
> - **Tauri v2** usa un modelo de permisos diferente a v1. Cada capability del backend debe estar declarada en `tauri.conf.json`.
> - **shadcn/ui** NO es un paquete npm. Los componentes se copian al proyecto usando `npx shadcn@latest add <component>`. Se personalizan directamente.
> - **TailwindCSS v4** tiene una API diferente a v3 (no usa `tailwind.config.js`, usa CSS-first config). Verificar la versión antes de configurar.
