# 1. Visión General del Proyecto

[← Volver al Índice](./README.md)

---

## 🎯 ¿Qué es Developer Project Hub?

**Developer Project Hub** es una aplicación de escritorio local que actúa como un **centro de control** para desarrolladores que manejan múltiples proyectos simultáneamente.

### Problema que resuelve

Los desarrolladores que trabajan con muchos repositorios locales (monorepos, microservicios, side projects) necesitan:
- Recordar dónde está cada proyecto
- Abrir terminales y editores manualmente
- Verificar el estado de git de cada repo uno por uno
- Navegar entre proyectos sin contexto visual

### Solución

Una app desktop que permite:

| Funcionalidad | Descripción |
|--------------|-------------|
| **Registrar proyectos** | Ruta absoluta manual o **escaneo de carpeta padre** (hasta 5 niveles de profundidad) |
| **Escaneo “workspace-aware”** | Un proyecto por raíz lógica: Nx, Turborepo, pnpm/npm **workspaces**, Lerna, Rush, **Melos** (Flutter/Dart), **Cargo** `[workspace]`, **Go** `go.work`, **Bazel**. No duplica cada `apps/*` / `packages/*`. Tras registrar una raíz, **no sigue bajando** en ese árbol |
| **Información automática** | Heurísticas sobre `package.json`, `Cargo.toml`, `go.mod`, Python, etc. |
| **Estado de Git** | Rama, mensaje del último commit, **marca de tiempo ISO del último commit** (ordenación), cambios sin commitear |
| **Detección de stack** | React, Vue, Angular, Next, Nx, Rust, Go, Python, Docker, etc. (según archivos presentes) |
| **Editores** | Cursor, VS Code, Zed, WebStorm, Sublime, Neovim, Antigravity; editor por defecto y selector al abrir |
| **Ordenación** | Por nombre, fecha de registro, **última apertura desde el hub**, fecha del último commit Git, estado Git |
| **Grupos** | Agrupar proyectos (incl. drag-and-drop), **lanzar todos** con delay configurable |
| **Apariencia** | Varios **temas UI** (variables CSS + `data-theme`); **i18n** (`react-i18next`) |
| **Multi-ventana** | Sincronización de tema y ajustes entre ventanas vía **eventos Tauri** |
| **Paleta de comandos** | Atajos globales (búsqueda, ajustes, etc.) |

> Detalle técnico para agentes de IA: [00-ai-brief.md](./00-ai-brief.md). README en inglés: [../README.md](../README.md).

---

## 🖥️ Tipo de Aplicación

| Aspecto | Detalle |
|---------|---------|
| **Tipo** | Aplicación Desktop (NO web, NO server) |
| **Framework** | Tauri v2 |
| **Frontend** | React 19 + Vite + TypeScript |
| **Backend nativo** | Rust (integrado en Tauri) |
| **Persistencia** | JSON en directorio de datos de la app (Tauri) |
| **Red** | No requiere conexión a internet |

---

## 🎨 Identidad Visual

El diseño sigue un estilo **"Futuristic Neon Glass UI"**:

- Fondo negro profundo
- Glassmorphism sutil con transparencias
- Glow neón verde (#00FF88) y azul (#006BFF)
- Gradientes verde → azul
- Bordes redondeados y sombras difusas
- Hover con iluminación
- UI minimalista pero tecnológica

Inspiración: dashboards futuristas, interfaces de IA, SaaS modernos premium.

> Ver detalles completos en [07-design-system.md](./07-design-system.md)

---

## 📐 Layout Principal (Single Page)

La aplicación es **una sola pantalla** sin sidebar:

```
┌─────────────────────────────────────────────────────┐
│  🔍 Buscador    │    ➕ Agregar Proyecto    │  ⚙️   │  ← Top Bar
├─────────────────────────────────────────────────────┤
│  [Todos] [Trabajo] [Personal] [Side Projects] ...   │  ← Filtros (chips)
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Project  │  │ Project  │  │ Project  │         │
│  │ Card     │  │ Card     │  │ Card     │         │  ← Grid Principal
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Group    │  │ Project  │  │ Project  │         │
│  │ Card     │  │ Card     │  │ Card     │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🚦 Estados Visuales de Proyectos

Cada project card cambia su glow según el estado de git:

| Estado | Color | Significado |
|--------|-------|-------------|
| 🟢 **Clean** | Verde glow (#00FF88) | Sin cambios, todo pusheado |
| 🟡 **Uncommitted** | Amarillo glow (#FFD700) | Hay cambios sin commitear |
| 🔴 **Unpushed** | Rojo glow (#FF4444) | Hay commits sin pushear |

---

## 📦 Entregable Final

- App ultra fluida
- UX minimalista
- Control total de proyectos locales
- Información en tiempo real
- Diseño moderno, vendible como producto SaaS
- Código limpio, componentes reutilizables, arquitectura escalable
