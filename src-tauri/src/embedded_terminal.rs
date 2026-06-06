use chrono::Local;
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use serde::Serialize;
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use uuid::Uuid;

pub const RUN_SESSION_OUTPUT_EVENT: &str = "run-session-output";
pub const RUN_SESSION_EXIT_EVENT: &str = "run-session-exit";

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RunSessionOutputPayload {
    pub session_id: String,
    pub data: String,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RunSessionExitPayload {
    pub session_id: String,
    pub exit_code: Option<i32>,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RunSessionInfo {
    pub id: String,
    pub project_id: String,
    pub project_name: String,
    pub command: String,
    pub cwd: String,
    pub pid: Option<u32>,
    /// running | exited
    pub status: String,
    pub started_at: String,
    pub exit_code: Option<i32>,
}

struct SessionHandle {
    info: Arc<Mutex<RunSessionInfo>>,
    child: Arc<Mutex<Option<Box<dyn portable_pty::Child + Send + Sync>>>>,
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    master: Arc<Mutex<Box<dyn portable_pty::MasterPty + Send>>>,
}

pub struct RunSessionStore {
    sessions: HashMap<String, SessionHandle>,
}

impl RunSessionStore {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
        }
    }

    pub fn list(&self) -> Vec<RunSessionInfo> {
        let mut list: Vec<_> = self
            .sessions
            .values()
            .filter_map(|s| s.info.lock().ok().map(|i| i.clone()))
            .collect();
        list.sort_by(|a, b| b.started_at.cmp(&a.started_at));
        list
    }

    pub fn spawn(
        &mut self,
        app: &AppHandle,
        project_id: String,
        project_name: String,
        cwd: String,
        command: String,
    ) -> Result<RunSessionInfo, String> {
        let path = std::path::Path::new(&cwd);
        if !path.is_dir() {
            return Err(format!("Project path does not exist: {}", cwd));
        }

        let pty_system = native_pty_system();
        let pair = pty_system
            .openpty(PtySize {
                rows: 24,
                cols: 100,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to open PTY: {}", e))?;

        let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string());
        let shell_line = format!("cd {} && {}", shell_escape_single(&cwd), command);

        let mut cmd = CommandBuilder::new(&shell);
        cmd.args(["-lic", &shell_line]);
        cmd.cwd(&cwd);

        let child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn command: {}", e))?;

        let pid = child.process_id();
        drop(pair.slave);

        let mut reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| format!("PTY reader: {}", e))?;
        let writer = pair
            .master
            .take_writer()
            .map_err(|e| format!("PTY writer: {}", e))?;

        let session_id = Uuid::new_v4().to_string();
        let info = RunSessionInfo {
            id: session_id.clone(),
            project_id,
            project_name,
            command,
            cwd,
            pid,
            status: "running".to_string(),
            started_at: Local::now().to_rfc3339(),
            exit_code: None,
        };

        let info_arc = Arc::new(Mutex::new(info.clone()));
        let writer_arc = Arc::new(Mutex::new(writer));
        let master_arc = Arc::new(Mutex::new(pair.master));
        let child_arc = Arc::new(Mutex::new(Some(child)));

        let app_out = app.clone();
        let sid_out = session_id.clone();
        thread::spawn(move || {
            let mut buf = [0u8; 8192];
            loop {
                match reader.read(&mut buf) {
                    Ok(0) => break,
                    Ok(n) => {
                        let data = String::from_utf8_lossy(&buf[..n]).into_owned();
                        let _ = app_out.emit(
                            RUN_SESSION_OUTPUT_EVENT,
                            RunSessionOutputPayload {
                                session_id: sid_out.clone(),
                                data,
                            },
                        );
                    }
                    Err(_) => break,
                }
            }
        });

        let app_exit = app.clone();
        let sid_exit = session_id.clone();
        let child_wait = child_arc.clone();
        let info_wait = info_arc.clone();
        thread::spawn(move || {
            // Take the child quickly — never hold the mutex during wait().
            let child = child_wait
                .lock()
                .ok()
                .and_then(|mut guard| guard.take());

            let exit_code = child.and_then(|mut c| {
                c.wait()
                    .ok()
                    .map(|status| status.exit_code() as i32)
            });

            if let Ok(mut locked) = info_wait.lock() {
                locked.status = "exited".to_string();
                locked.exit_code = exit_code;
            }
            let _ = app_exit.emit(
                RUN_SESSION_EXIT_EVENT,
                RunSessionExitPayload {
                    session_id: sid_exit,
                    exit_code,
                },
            );
        });

        self.sessions.insert(
            session_id,
            SessionHandle {
                info: info_arc,
                child: child_arc,
                writer: writer_arc,
                master: master_arc,
            },
        );
        Ok(info)
    }

    pub fn write_input(&self, session_id: &str, data: &str) -> Result<(), String> {
        let handle = self
            .sessions
            .get(session_id)
            .ok_or_else(|| "Session not found".to_string())?;
        let status = handle
            .info
            .lock()
            .map_err(|e| e.to_string())?
            .status
            .clone();
        if status != "running" {
            return Err("Session is not running".to_string());
        }
        let mut writer = handle
            .writer
            .lock()
            .map_err(|e| format!("Writer lock: {}", e))?;
        writer
            .write_all(data.as_bytes())
            .map_err(|e| format!("Write failed: {}", e))?;
        writer
            .flush()
            .map_err(|e| format!("Flush failed: {}", e))?;
        Ok(())
    }

    pub fn resize(&self, session_id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let handle = self
            .sessions
            .get(session_id)
            .ok_or_else(|| "Session not found".to_string())?;
        let master = handle
            .master
            .lock()
            .map_err(|e| format!("Master lock: {}", e))?;
        master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Resize failed: {}", e))?;
        Ok(())
    }

    pub fn kill(&self, session_id: &str) -> Result<(), String> {
        let handle = self
            .sessions
            .get(session_id)
            .ok_or_else(|| "Session not found".to_string())?;

        let pid = {
            let mut info = handle.info.lock().map_err(|e| e.to_string())?;
            if info.status != "running" {
                return Ok(());
            }
            info.status = "exited".to_string();
            info.exit_code = Some(130);
            info.pid
        };

        // Graceful stop: Ctrl+C into the PTY (reaches the foreground process group).
        if let Ok(mut writer) = handle.writer.lock() {
            let _ = writer.write_all(b"\x03");
            let _ = writer.flush();
        }

        // If the wait thread has not taken the child yet, kill via portable-pty.
        if let Ok(mut guard) = handle.child.lock() {
            if let Some(mut child) = guard.take() {
                let _ = child.kill();
            }
        }

        // Fallback: signal the shell PID directly (non-blocking).
        if let Some(pid) = pid {
            signal_pid(pid, libc::SIGTERM);
            thread::spawn(move || {
                thread::sleep(Duration::from_millis(400));
                signal_pid(pid, libc::SIGKILL);
            });
        }

        Ok(())
    }

    pub fn kill_all_running(&self) -> Result<(), String> {
        let running: Vec<String> = self
            .sessions
            .values()
            .filter_map(|s| {
                s.info
                    .lock()
                    .ok()
                    .filter(|i| i.status == "running")
                    .map(|i| i.id.clone())
            })
            .collect();
        for id in running {
            self.kill(&id)?;
        }
        Ok(())
    }
}

pub fn spawn_projects_with_delay(
    store: Arc<Mutex<RunSessionStore>>,
    app: AppHandle,
    delay_ms: i32,
    projects: Vec<(String, String, String, String)>,
) -> Vec<Result<RunSessionInfo, String>> {
    let mut results = Vec::new();
    for (i, (project_id, project_name, cwd, command)) in projects.into_iter().enumerate() {
        if i > 0 && delay_ms > 0 {
            thread::sleep(Duration::from_millis(delay_ms as u64));
        }
        let result = store
            .lock()
            .map_err(|e| e.to_string())
            .and_then(|mut guard| guard.spawn(&app, project_id, project_name, cwd, command));
        results.push(result);
    }
    results
}

fn shell_escape_single(s: &str) -> String {
    format!("'{}'", s.replace('\'', "'\\''"))
}

fn signal_pid(pid: u32, signal: i32) {
    #[cfg(unix)]
    {
        unsafe {
            libc::kill(pid as i32, signal);
        }
    }
    #[cfg(not(unix))]
    {
        let _ = (pid, signal);
    }
}
