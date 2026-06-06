import type { ProjectService, SettingsService } from './interfaces';
import { MockEnvService } from './env-service';
import { MockProjectService, MockSettingsService } from './mock';
import { TauriEnvService, type EnvService } from './env-service';
import { MockRunService, TauriRunService, type RunService } from './run-service';
import { TauriProjectService, TauriSettingsService } from './tauri';

function isTauriRuntime(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const runtimeWindow = window as Window & {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  };

  return (
    typeof runtimeWindow.__TAURI__ !== 'undefined' ||
    typeof runtimeWindow.__TAURI_INTERNALS__ !== 'undefined'
  );
}

export type { ProjectService, SettingsService } from './interfaces';
export type { EnvService } from './env-service';
export type { RunService } from './run-service';

export function getProjectService(): ProjectService {
  return isTauriRuntime() ? new TauriProjectService() : new MockProjectService();
}

export function getSettingsService(): SettingsService {
  return isTauriRuntime() ? new TauriSettingsService() : new MockSettingsService();
}

export function getEnvService(): EnvService {
  return isTauriRuntime() ? new TauriEnvService() : new MockEnvService();
}

export function getRunService(): RunService {
  return isTauriRuntime() ? new TauriRunService() : new MockRunService();
}
