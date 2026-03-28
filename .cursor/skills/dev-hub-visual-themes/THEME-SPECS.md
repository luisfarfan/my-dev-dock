# Especificación de temas — Developer Project Hub

Fuente técnica: `src/styles.css`. La UI usa tokens (`text-foreground`, `border-border`, `bg-modal-backdrop`, etc.) para que todos los temas funcionen.

## Oscuros

| ID | data-theme | Notas |
|----|------------|--------|
| Neon glass | *(ninguno)* | Identidad por defecto, verde/azul neón. |
| Aurora | `aurora` | Violeta/cian, malla tipo Aurora UI. |
| OLED | `oled` | Negro #000, acento verde intenso. |
| Obsidian | `obsidian` | Zinc/índigo, SaaS oscuro. |

## Día (claros)

| ID | data-theme | Notas |
|----|------------|--------|
| Día (slate) | `day` | Fondo #f1f5f9, texto slate-900, primario esmeralda; `color-scheme: light`. |
| Alba (papel) | `dawn` | Fondo cálido #faf7f2, acento ámbar; menos contraste frío que `day`. |

Ambos ajustan scrollbar, scrim de modales (`--app-modal-backdrop`) y superficies glass para fondos claros.
