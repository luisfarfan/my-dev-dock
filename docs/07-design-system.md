# 7. Sistema de Diseño

[← Volver al Índice](./README.md)

---

## 🎨 Identidad Visual: Futuristic Neon Glass UI

### Filosofía
- **Minimalista pero tecnológico**: Poco texto, mucha información visual
- **Premium y moderno**: Sensación de producto SaaS de alta gama
- **Funcional**: El diseño sirve a la función, no al revés

### Inspiración
- Dashboards futuristas (Sci-Fi UIs)
- Interfaces de IA (ChatGPT, Claude, etc.)
- SaaS modernos premium (Linear, Raycast, Arc)

---

## 🎨 Paleta de Colores

### Colores Base

| Variable CSS | Hex | Uso |
|-------------|-----|-----|
| `--bg-primary` | `#0B0B0B` | Fondo principal de la app |
| `--bg-secondary` | `#0F1115` | Fondo de cards y paneles |
| `--bg-elevated` | `#161A22` | Elementos elevados, hover |
| `--bg-glass` | `rgba(255,255,255,0.03)` | Fondo glassmorphism |

### Colores de Acento (Neon)

| Variable CSS | Hex | Uso |
|-------------|-----|-----|
| `--neon-green` | `#00FF88` | Acento primario, estado clean |
| `--neon-blue` | `#006BFF` | Acento secundario, links |
| `--neon-yellow` | `#FFD700` | Estado uncommitted |
| `--neon-red` | `#FF4444` | Estado unpushed, errores |

### Gradientes

| Variable CSS | Valor | Uso |
|-------------|-------|-----|
| `--gradient-primary` | `linear-gradient(135deg, #00FF88, #006BFF)` | Botones, highlights |
| `--gradient-glow` | `radial-gradient(ellipse, rgba(0,255,136,0.15), transparent 70%)` | Glow de fondo |

### Texto

| Variable CSS | Hex | Uso |
|-------------|-----|-----|
| `--text-primary` | `#E8E8E8` | Texto principal |
| `--text-secondary` | `#8B8B8B` | Texto secundario |
| `--text-muted` | `#4A4A4A` | Texto discreto |
| `--text-accent` | `#00FF88` | Texto destacado |

### Bordes

| Variable CSS | Valor | Uso |
|-------------|-------|-----|
| `--border-subtle` | `rgba(255,255,255,0.06)` | Bordes de cards |
| `--border-hover` | `rgba(255,255,255,0.12)` | Bordes en hover |
| `--border-glow-green` | `rgba(0,255,136,0.3)` | Borde glow verde |
| `--border-glow-blue` | `rgba(0,107,255,0.3)` | Borde glow azul |

---

## 📐 Theme CSS (`theme.css`)

```css
:root {
  /* Backgrounds */
  --bg-primary: #0B0B0B;
  --bg-secondary: #0F1115;
  --bg-elevated: #161A22;
  --bg-glass: rgba(255, 255, 255, 0.03);

  /* Neon Colors */
  --neon-green: #00FF88;
  --neon-blue: #006BFF;
  --neon-yellow: #FFD700;
  --neon-red: #FF4444;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #00FF88, #006BFF);
  --gradient-glow: radial-gradient(ellipse, rgba(0, 255, 136, 0.15), transparent 70%);

  /* Text */
  --text-primary: #E8E8E8;
  --text-secondary: #8B8B8B;
  --text-muted: #4A4A4A;
  --text-accent: #00FF88;

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(255, 255, 255, 0.12);

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-glow-green: 0 0 20px rgba(0, 255, 136, 0.15);
  --shadow-glow-blue: 0 0 20px rgba(0, 107, 255, 0.15);
  --shadow-glow-yellow: 0 0 20px rgba(255, 215, 0, 0.15);
  --shadow-glow-red: 0 0 20px rgba(255, 68, 68, 0.15);

  /* Spacing */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
}
```

---

## ✨ Glassmorphism

### Receta Base

```css
.glass-card {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.glass-card:hover {
  border-color: var(--border-hover);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-green);
}
```

---

## 💡 Neon Glow por Estado

### Clean (Verde)

```css
.project-card--clean {
  border-color: rgba(0, 255, 136, 0.2);
  box-shadow: 
    0 0 15px rgba(0, 255, 136, 0.08),
    inset 0 0 15px rgba(0, 255, 136, 0.03);
}

.project-card--clean .status-indicator {
  background: var(--neon-green);
  box-shadow: 0 0 10px var(--neon-green);
}
```

### Uncommitted (Amarillo)

```css
.project-card--uncommitted {
  border-color: rgba(255, 215, 0, 0.2);
  box-shadow:
    0 0 15px rgba(255, 215, 0, 0.08),
    inset 0 0 15px rgba(255, 215, 0, 0.03);
}

.project-card--uncommitted .status-indicator {
  background: var(--neon-yellow);
  box-shadow: 0 0 10px var(--neon-yellow);
}
```

### Unpushed (Rojo)

```css
.project-card--unpushed {
  border-color: rgba(255, 68, 68, 0.2);
  box-shadow:
    0 0 15px rgba(255, 68, 68, 0.08),
    inset 0 0 15px rgba(255, 68, 68, 0.03);
}

.project-card--unpushed .status-indicator {
  background: var(--neon-red);
  box-shadow: 0 0 10px var(--neon-red);
}
```

---

## 🔤 Tipografía

| Uso | Font | Weight | Size |
|-----|------|--------|------|
| Headings | Inter | 600-700 | 18-24px |
| Body | Inter | 400 | 14px |
| Code/Paths | JetBrains Mono | 400 | 13px |
| Labels | Inter | 500 | 12px |
| Badges | Inter | 600 | 11px |

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

code, .path, .mono {
  font-family: 'JetBrains Mono', monospace;
}
```

> [!NOTE]
> En una app Tauri, las fuentes pueden incluirse localmente en `public/fonts/` para no depender de Google Fonts en una app offline. Considerar empaquetar las fuentes con la app.

---

## 🎬 Animaciones y Micro-interacciones

### Hover en Cards

```css
.project-card {
  transition: 
    transform var(--transition-normal),
    box-shadow var(--transition-normal),
    border-color var(--transition-normal);
}

.project-card:hover {
  transform: translateY(-3px);
}
```

### Pulse del Status Indicator

```css
@keyframes neon-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.status-indicator--active {
  animation: neon-pulse 2s ease-in-out infinite;
}
```

### Entrada de Cards (Stagger)

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.project-card {
  animation: fade-in-up 0.4s ease forwards;
  animation-delay: calc(var(--card-index) * 0.05s);
}
```

### Filter Chip Glow

```css
.filter-chip--active {
  background: var(--gradient-primary);
  color: #000;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
}
```

---

## 📐 Layout Specs

| Elemento | Spec |
|----------|------|
| **Grid columns** | `repeat(auto-fill, minmax(340px, 1fr))` |
| **Grid gap** | `20px` |
| **Card padding** | `20px 24px` |
| **Top bar height** | `64px` |
| **Filter bar height** | `48px` |
| **Content padding** | `24px` |
| **Max content width** | `1440px` |

---

## 🚫 Anti-patterns de Diseño

| ❌ NO hacer | ✅ SÍ hacer |
|------------|------------|
| Usar colores planos (#FF0000) | Usar tonos neon con transparencia |
| Bordes gruesos y sólidos | Bordes finos con transparencia |
| Sombras negras duras | Sombras con glow de color |
| Backgrounds blancos | Fondo negro profundo |
| Fuentes del sistema sin estilizar | Inter + JetBrains Mono |
| Buttons sin estados | Hover con glow + transition |
| Cards sin feedback visual | Cards con glow según estado git |
