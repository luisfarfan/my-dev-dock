# 📚 Developer Project Hub — Documentation Index

> **Proyecto**: Developer Project Hub  
> **Tipo**: Aplicación desktop **Tauri v2** + React (Vite), repo único (sin Nx)  
> **Gestor de paquetes**: **Bun**  
> **Última actualización**: 2026-03-22

---

## 📖 Índice de Documentación

| #  | Documento | Descripción |
|----|-----------|-------------|
| 1  | [Visión General del Proyecto](./01-project-overview.md) | Qué es, qué hace, y cuál es el producto final |
| 2  | [Arquitectura del Sistema](./02-architecture.md) | Diagrama de arquitectura, capas, y cómo se comunican |
| 3  | [Estructura del repositorio](./03-monorepo-structure.md) | Mapa de carpetas y convenciones (histórico: título antiguo “monorepo”) |
| 4  | [Stack Tecnológico](./04-tech-stack.md) | Tecnologías, versiones, y por qué se eligió cada una |
| 5  | [Guía del Frontend (React)](./05-frontend-guide.md) | Componentes, estado, rutas, y patrones del frontend |
| 6  | [Guía del Backend (Tauri/Rust)](./06-backend-guide.md) | Commands de Tauri, acceso al sistema, y API interna |
| 7  | [Sistema de Diseño](./07-design-system.md) | Colores, tipografía, glassmorphism, glow, componentes UI |
| 8  | [Modelos de Datos](./08-data-models.md) | Interfaces TypeScript, tipos compartidos, contratos |
| 9  | [Guía de Desarrollo](./09-development-guide.md) | Cómo arrancar, desarrollar, probar, y contribuir |
| 10 | [Convenciones y Reglas](./10-conventions.md) | Naming, estructura de archivos, patterns obligatorios |

---

## 🤖 Documentación para AI Editors

| Documento | Propósito |
|-----------|-----------|
| [AGENTS.md](../AGENTS.md) | Instrucciones para editores AI (Cursor, etc.) |
| [CLAUDE.md](../CLAUDE.md) | Instrucciones para Claude Code |

---

## ⚡ Quick Reference (Bun + Tauri)

```bash
# Instalar dependencias
bun install

# Solo frontend (Vite) — mocks si no hay Tauri
bun run dev
# → http://localhost:1420 (puerto fijado para Tauri en vite.config)

# App desktop (frontend + Rust)
bun run tauri dev

# Build frontend (TypeScript + Vite)
bun run build

# Build / empaquetado Tauri (release)
bun run tauri build
```

### Backend Rust (directo)

```bash
cd src-tauri
cargo check
cargo test
```

---

> [!NOTE]
> Esta documentación es la **fuente de verdad** del proyecto. Los documentos 02–08 pueden seguir mencionando Nx o pnpm en secciones antiguas; la **guía operativa actual** es esta página y [09-development-guide.md](./09-development-guide.md).
