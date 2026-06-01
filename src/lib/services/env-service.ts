import { invoke } from '@tauri-apps/api/core';
import type { EnvVarEntry } from '@org/models';
import { SYSTEM_ENV_PROJECT_ID } from '@org/models';

export interface ScanEnvVarsRequest {
  includeSystem?: boolean;
}

export interface EnvService {
  scanEnvVars(request?: ScanEnvVarsRequest): Promise<EnvVarEntry[]>;
}

export class TauriEnvService implements EnvService {
  async scanEnvVars(request?: ScanEnvVarsRequest): Promise<EnvVarEntry[]> {
    return invoke<EnvVarEntry[]>('scan_env_vars', {
      includeSystem: request?.includeSystem ?? false,
    });
  }
}

const MOCK_ENV_ENTRIES: EnvVarEntry[] = [
  {
    projectId: SYSTEM_ENV_PROJECT_ID,
    projectName: 'System',
    projectPath: '',
    fileName: 'process',
    filePath: 'process',
    key: 'PATH',
    value: '/usr/local/bin:/usr/bin',
    lineNumber: 0,
    isExample: false,
    source: 'system',
  },
  {
    projectId: '1',
    projectName: 'dev-hub',
    projectPath: '/Users/lucho/projects/me/dev-hub',
    fileName: '.env.local',
    filePath: '/Users/lucho/projects/me/dev-hub/.env.local',
    key: 'DATABASE_URL',
    value: 'postgres://localhost:5432/devhub',
    lineNumber: 1,
    isExample: false,
  },
  {
    projectId: '1',
    projectName: 'dev-hub',
    projectPath: '/Users/lucho/projects/me/dev-hub',
    fileName: '.env.local',
    filePath: '/Users/lucho/projects/me/dev-hub/.env.local',
    key: 'NEXT_PUBLIC_API_URL',
    value: 'http://localhost:3000',
    lineNumber: 2,
    isExample: false,
  },
  {
    projectId: '2',
    projectName: 'tauri-app',
    projectPath: '/Users/lucho/projects/tauri-app',
    fileName: '.env',
    filePath: '/Users/lucho/projects/tauri-app/.env',
    key: 'DATABASE_URL',
    value: 'postgres://localhost:5432/tauri',
    lineNumber: 3,
    isExample: false,
  },
  {
    projectId: '3',
    projectName: 'api-service',
    projectPath: '/Users/lucho/projects/api-service',
    fileName: '.env',
    filePath: '/Users/lucho/projects/api-service/.env',
    key: 'JWT_SECRET',
    value: 'super-secret-jwt',
    lineNumber: 1,
    isExample: false,
  },
];

export class MockEnvService implements EnvService {
  async scanEnvVars(request?: ScanEnvVarsRequest): Promise<EnvVarEntry[]> {
    const includeSystem = request?.includeSystem ?? false;
    if (includeSystem) return [...MOCK_ENV_ENTRIES];
    return MOCK_ENV_ENTRIES.filter((e) => e.source !== 'system');
  }
}
