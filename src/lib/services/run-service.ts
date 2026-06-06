import { invoke } from '@tauri-apps/api/core';
import type {
  RunCommandResolution,
  RunProjectResult,
  RunSession,
  TerminalId,
  TerminalInfo,
} from '@org/models';

export interface RunService {
  getInstalledTerminals(): Promise<TerminalInfo[]>;
  testTerminal(terminalId: TerminalId, minimize?: boolean): Promise<void>;
  resolveRunCommand(path: string, custom?: string): Promise<RunCommandResolution>;
  setProjectRunCommand(projectId: string, runCommand?: string): Promise<void>;
  runProject(projectId: string): Promise<RunProjectResult>;
  runProjects(projectIds: string[]): Promise<RunProjectResult[]>;
  listSessions(): Promise<RunSession[]>;
  killSession(sessionId: string): Promise<void>;
  killAllSessions(): Promise<void>;
  writeSession(sessionId: string, data: string): Promise<void>;
  resizeSession(sessionId: string, cols: number, rows: number): Promise<void>;
}

export class TauriRunService implements RunService {
  async getInstalledTerminals(): Promise<TerminalInfo[]> {
    return invoke<TerminalInfo[]>('get_installed_terminals');
  }

  async testTerminal(terminalId: TerminalId, minimize = true): Promise<void> {
    await invoke('test_terminal_app', { terminalId, minimize });
  }

  async resolveRunCommand(path: string, custom?: string): Promise<RunCommandResolution> {
    return invoke<RunCommandResolution>('resolve_project_run_command', { path, custom });
  }

  async setProjectRunCommand(projectId: string, runCommand?: string): Promise<void> {
    await invoke('set_project_run_command', { projectId, runCommand: runCommand ?? null });
  }

  async runProject(projectId: string): Promise<RunProjectResult> {
    return invoke<RunProjectResult>('run_project_in_terminal', { projectId });
  }

  async runProjects(projectIds: string[]): Promise<RunProjectResult[]> {
    return invoke<RunProjectResult[]>('run_projects_in_terminal', { projectIds });
  }

  async listSessions(): Promise<RunSession[]> {
    return invoke<RunSession[]>('list_run_sessions');
  }

  async killSession(sessionId: string): Promise<void> {
    await invoke('kill_run_session', { sessionId });
  }

  async killAllSessions(): Promise<void> {
    await invoke('kill_all_run_sessions');
  }

  async writeSession(sessionId: string, data: string): Promise<void> {
    await invoke('write_run_session', { sessionId, data });
  }

  async resizeSession(sessionId: string, cols: number, rows: number): Promise<void> {
    await invoke('resize_run_session', { sessionId, cols, rows });
  }
}

const MOCK_TERMINALS: TerminalInfo[] = [
  { id: 'terminal', name: 'Terminal', installed: true },
  { id: 'iterm', name: 'iTerm', installed: false },
];

let mockSessionCounter = 0;
const mockSessions: RunSession[] = [];

export class MockRunService implements RunService {
  async getInstalledTerminals(): Promise<TerminalInfo[]> {
    return [...MOCK_TERMINALS];
  }

  async testTerminal(): Promise<void> {
    return;
  }

  async resolveRunCommand(path: string, custom?: string): Promise<RunCommandResolution> {
    if (custom?.trim()) {
      return { command: custom.trim(), source: 'custom', confidence: 'high' };
    }
    return {
      command: 'npm run dev',
      scriptName: 'dev',
      packageManager: 'npm',
      source: 'detected',
      confidence: 'high',
    };
  }

  async setProjectRunCommand(): Promise<void> {
    return;
  }

  async runProject(projectId: string): Promise<RunProjectResult> {
    mockSessionCounter += 1;
    const session: RunSession = {
      id: `mock-session-${mockSessionCounter}`,
      projectId,
      projectName: 'mock',
      command: 'npm run dev',
      cwd: '/tmp',
      status: 'running',
      startedAt: new Date().toISOString(),
    };
    mockSessions.unshift(session);
    return {
      projectId,
      projectName: 'mock',
      command: 'npm run dev',
      terminalId: 'embedded',
      sessionId: session.id,
      success: true,
    };
  }

  async runProjects(projectIds: string[]): Promise<RunProjectResult[]> {
    return Promise.all(projectIds.map((id) => this.runProject(id)));
  }

  async listSessions(): Promise<RunSession[]> {
    return [...mockSessions];
  }

  async killSession(sessionId: string): Promise<void> {
    const session = mockSessions.find((s) => s.id === sessionId);
    if (session) {
      session.status = 'exited';
      session.exitCode = 0;
    }
  }

  async killAllSessions(): Promise<void> {
    for (const session of mockSessions) {
      if (session.status === 'running') {
        session.status = 'exited';
        session.exitCode = 0;
      }
    }
  }

  async writeSession(): Promise<void> {
    return;
  }

  async resizeSession(): Promise<void> {
    return;
  }
}
