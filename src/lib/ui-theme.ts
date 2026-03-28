export type UiThemeId = 'neon' | 'aurora' | 'oled' | 'obsidian' | 'day' | 'dawn';

export const UI_THEME_IDS: UiThemeId[] = ['neon', 'aurora', 'oled', 'obsidian', 'day', 'dawn'];

export const UI_THEME_LABELS: Record<UiThemeId, { title: string; hint: string }> = {
  neon: {
    title: 'Neon glass',
    hint: 'Verde/azul neón, vidrio — identidad actual del producto.',
  },
  aurora: {
    title: 'Aurora nocturna',
    hint: 'Malla violeta/cian, estilo Aurora UI (premium creativo).',
  },
  oled: {
    title: 'OLED mínimo',
    hint: 'Negro puro, acentos contenidos — estilo OLED / bajo brillo.',
  },
  obsidian: {
    title: 'Obsidian desk',
    hint: 'Pizarra fría zinc/violeta — SaaS oscuro tipo Linear.',
  },
  day: {
    title: 'Día (slate)',
    hint: 'Claro frío, alto contraste — uso diurno / oficina.',
  },
  dawn: {
    title: 'Alba (papel)',
    hint: 'Claro cálido, tonos arena — menos fatiga visual.',
  },
};

const STORAGE_KEY = 'dev-hub-ui-theme';

type PersistShape = { state?: { themeId?: UiThemeId } };

export function applyUiTheme(id: UiThemeId): void {
  const root = document.documentElement;
  if (id === 'neon') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', id);
  }
}

/** Evita flash antes de que Zustand rehidrate. */
export function hydrateUiThemeFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as PersistShape;
    const id = parsed?.state?.themeId;
    if (id && UI_THEME_IDS.includes(id)) {
      applyUiTheme(id);
    }
  } catch {
    /* ignore */
  }
}
