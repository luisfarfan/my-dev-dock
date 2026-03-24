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
| **Registrar proyectos** | Agregar rutas absolutas a proyectos locales |
| **Información automática** | Lee `package.json`, `angular.json`, `nx.json`, etc. |
| **Estado de Git en tiempo real** | Branch actual, último commit, cambios pendientes |
| **Detección de stack** | Identifica React, Angular, Python, Node, etc. |
| **Abrir en editores** | VS Code, Cursor, u otros editores configurados |
| **Grupos de proyectos** | Agrupar proyectos por contexto (trabajo, personal, etc.) |
| **Launch All** | Abrir múltiples proyectos en paralelo con delay configurable |

---

## 🖥️ Tipo de Aplicación

| Aspecto | Detalle |
|---------|---------|
| **Tipo** | Aplicación Desktop (NO web, NO server) |
| **Framework** | Tauri v2 |
| **Frontend** | React 19 + Vite + TypeScript |
| **Backend nativo** | Rust (integrado en Tauri) |
| **Persistencia** | Local filesystem (JSON o SQLite) |
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
