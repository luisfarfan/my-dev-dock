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
| **Editores** | Cursor, VS Code, Zed, WebStorm, Sublime, Neovim, Antigravity (`agy` / app); editor por defecto, selector al abrir, **copiar ruta** en cada card |
| **Ordenación** | Por nombre, fecha de registro, **última apertura desde el hub**, fecha del último commit Git, estado Git |
| **Grupos** | Agrupar proyectos (incl. drag-and-drop), **lanzar todos** con delay configurable |
| **Workspaces** | Colecciones con sugerencias inteligentes; **panel expandible/minimizable** de acceso rápido por workspace activo; pills + **⌘K** |
| **Env Index** | Buscar y copiar variables de `.env*` de proyectos registrados y entorno del SO (solo lectura); drawer + **⌘K** |
| **Apariencia** | Varios **temas UI** (variables CSS + `data-theme`); **i18n** (`react-i18next`) |
| **Multi-ventana** | Sincronización de tema y ajustes entre ventanas vía **eventos Tauri** |
| **Paleta de comandos** | **⌘K** — búsqueda env, cambio de workspace, ajustes, foco en búsqueda |

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
│  [Todos] [Proxima] [Side] ...   ← Workspaces (strip + panel expandible)
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ← Panel workspace (proyectos del cliente)
│  │ Quick    │  │ Quick    │
│  │ launch   │  │ launch   │
│  └──────────┘  └──────────┘
├─────────────────────────────────────────────────────┤
│  Grupos (batch launch) …                            │
├─────────────────────────────────────────────────────┤
│  Grid de todos los proyectos …                      │
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
