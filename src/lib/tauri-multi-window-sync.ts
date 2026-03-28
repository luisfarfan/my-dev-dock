import { emit } from '@tauri-apps/api/event';
import type { AppLocale } from '@/app/i18n/i18n';
import { isTauriRuntime } from '@/app/shared/utils/is-tauri-runtime';
import type { UiThemeId } from '@/lib/ui-theme';

export const TAURI_UI_THEME_EVENT = 'dev-hub-ui-theme-changed';
export const TAURI_APP_SETTINGS_EVENT = 'dev-hub-app-settings-changed';
export const TAURI_LOCALE_EVENT = 'dev-hub-locale-changed';

export async function broadcastUiThemeChange(themeId: UiThemeId): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await emit(TAURI_UI_THEME_EVENT, { themeId });
  } catch {
    /* ignore */
  }
}

export async function broadcastAppSettingsChanged(): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await emit(TAURI_APP_SETTINGS_EVENT, {});
  } catch {
    /* ignore */
  }
}

export async function broadcastLocaleChange(locale: AppLocale): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await emit(TAURI_LOCALE_EVENT, { locale });
  } catch {
    /* ignore */
  }
}
