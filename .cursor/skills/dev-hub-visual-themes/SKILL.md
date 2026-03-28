---
name: dev-hub-visual-themes
description: >-
  Temas visuales del Developer Project Hub (data-theme, variables --app-* en
  styles.css, useUiThemeStore). Incluye modos día (day, dawn) y oscuros. Usar al
  añadir temas o depurar contraste. Para metodología UI/UX general ver el skill
  ui-ux-pro-max en la misma carpeta .cursor/skills.
---

# Dev Hub — Temas visuales

## Cómo funciona

- **Atributo**: `data-theme` en `<html>`: `aurora` | `oled` | `obsidian` | `day` | `dawn`; sin atributo = **Neon glass**.
- **CSS**: `src/styles.css` — bloques `:root` y `[data-theme="…"]`; `@theme` expone tokens Tailwind (`background`, `modal-backdrop`, `neon-*`, etc.).
- **Persistencia**: `useUiThemeStore` + `hydrateUiThemeFromStorage()` en `main.tsx`.
- **Selector UI**: `ThemeAppearanceSection` en ajustes.

## Variables clave

| Grupo | Variables |
|-------|-----------|
| Semántico | `--app-color-*` (background, foreground, card, primary, ring, …) |
| Git / estado | `--app-neon-green` … `--app-neon-red` |
| Ambiente | `--app-mesh-a`, `--app-mesh-b`, `--app-modal-backdrop` |
| Scrollbar | `--scrollbar-thumb`, `--scrollbar-thumb-hover`, `--scrollbar-thumb-line` |
| Glass | `--surface-premium`, `--surface-border`, `--floating-panel-*` |

## Catálogo

Ver [THEME-SPECS.md](THEME-SPECS.md). Resumen: **neon** (default), **aurora**, **oled**, **obsidian**, **day** (slate claro), **dawn** (papel cálido).

## UI/UX Pro Max (oficial)

Instalado en `.cursor/skills/ui-ux-pro-max/` (MIT, [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)). Desde la raíz del repo:

```bash
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "saas desktop tool" --design-system -p "Dev Hub"
```

Actualizar el skill: `npx uipro-cli update` (CLI opcional) o volver a clonar el repo.

## Añadir un tema

1. Extender `UiThemeId` y `UI_THEME_IDS` en `src/lib/ui-theme.ts`.
2. Bloque `[data-theme="id"]` en `src/styles.css` reasignando las mismas variables que los demás temas.
