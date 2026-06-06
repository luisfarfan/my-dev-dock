use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;
use std::thread;
use std::time::Duration;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TerminalInfo {
    pub id: String,
    pub name: String,
    pub installed: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RunCommandResolution {
    pub command: Option<String>,
    pub script_name: Option<String>,
    pub package_manager: Option<String>,
    /// custom | detected | none
    pub source: String,
    /// high | medium | low
    pub confidence: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RunProjectResult {
    pub project_id: String,
    pub project_name: String,
    pub command: String,
    pub terminal_id: String,
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

struct TerminalDef {
    id: &'static str,
    name: &'static str,
    app_paths: &'static [&'static str],
}

const TERMINAL_DEFS: &[TerminalDef] = &[
    TerminalDef {
        id: "iterm",
        name: "iTerm",
        app_paths: &["/Applications/iTerm.app"],
    },
    TerminalDef {
        id: "warp",
        name: "Warp",
        app_paths: &["/Applications/Warp.app"],
    },
    TerminalDef {
        id: "ghostty",
        name: "Ghostty",
        app_paths: &["/Applications/Ghostty.app"],
    },
    TerminalDef {
        id: "wezterm",
        name: "WezTerm",
        app_paths: &["/Applications/WezTerm.app"],
    },
    TerminalDef {
        id: "alacritty",
        name: "Alacritty",
        app_paths: &["/Applications/Alacritty.app"],
    },
    TerminalDef {
        id: "kitty",
        name: "kitty",
        app_paths: &["/Applications/kitty.app"],
    },
    TerminalDef {
        id: "terminal",
        name: "Terminal",
        app_paths: &[
            "/System/Applications/Utilities/Terminal.app",
            "/Applications/Utilities/Terminal.app",
        ],
    },
];

const SCRIPT_PRIORITY: &[&str] = &[
    "dev",
    "start:dev",
    "start",
    "serve",
    "develop",
    "watch",
];

pub fn list_terminals() -> Vec<TerminalInfo> {
    TERMINAL_DEFS
        .iter()
        .map(|def| TerminalInfo {
            id: def.id.to_string(),
            name: def.name.to_string(),
            installed: terminal_installed(def),
        })
        .collect()
}

fn terminal_installed(def: &TerminalDef) -> bool {
    def.app_paths.iter().any(|p| Path::new(p).exists())
}

fn terminal_app_path(def: &TerminalDef) -> Option<&'static str> {
    def.app_paths
        .iter()
        .find(|p| Path::new(**p).exists())
        .copied()
}

fn find_terminal_def(id: &str) -> Option<&'static TerminalDef> {
    TERMINAL_DEFS.iter().find(|d| d.id == id)
}

fn shell_escape_single(s: &str) -> String {
    format!("'{}'", s.replace('\'', "'\\''"))
}

fn build_shell_line(cwd: &str, command: &str) -> String {
    format!("cd {} && {}", shell_escape_single(cwd), command)
}

fn escape_applescript_string(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"")
}

fn run_osascript(script: &str) -> Result<(), String> {
    let status = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .status()
        .map_err(|e| format!("Failed to run osascript: {}", e))?;
    if status.success() {
        Ok(())
    } else {
        Err("osascript exited with failure".to_string())
    }
}

#[cfg(target_os = "macos")]
fn spawn_iterm(line: &str, minimize: bool) -> Result<(), String> {
    let escaped = escape_applescript_string(line);
    let mini = if minimize {
        "delay 0.35\n        set miniaturized of newWindow to true"
    } else {
        ""
    };
    let script = format!(
        r#"tell application "iTerm"
    activate
    set newWindow to (create window with default profile)
    tell current session of newWindow
        write text "{escaped}"
    end tell
    {mini}
end tell"#
    );
    run_osascript(&script)
}

#[cfg(target_os = "macos")]
fn spawn_terminal_app(line: &str, minimize: bool) -> Result<(), String> {
    let escaped = escape_applescript_string(line);
    let mini = if minimize {
        r#"delay 0.35
    set miniaturized of front window to true"#
    } else {
        ""
    };
    let script = format!(
        r#"tell application "Terminal"
    activate
    do script "{escaped}"
    {mini}
end tell"#
    );
    run_osascript(&script)
}

#[cfg(target_os = "macos")]
fn spawn_warp(cwd: &str, command: &str, minimize: bool) -> Result<(), String> {
    let line = build_shell_line(cwd, command);
    let escaped = escape_applescript_string(&line);
    let script = format!(
        r#"tell application "Warp"
    activate
    do script "{escaped}"
end tell"#
    );
    if run_osascript(&script).is_ok() {
        if minimize {
            let _ = run_osascript(
                r#"tell application "Warp"
    set miniaturized of front window to true
end tell"#,
            );
        }
        return Ok(());
    }
    spawn_terminal_app(&line, minimize)
}

#[cfg(target_os = "macos")]
fn spawn_ghostty(cwd: &str, command: &str, minimize: bool) -> Result<(), String> {
    let line = build_shell_line(cwd, command);
    if Command::new("open")
        .args([
            "-na",
            "Ghostty",
            "--args",
            "-e",
            "/bin/zsh",
            "-lic",
            &line,
        ])
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
    {
        if minimize {
            let _ = run_osascript(
                r#"tell application "Ghostty"
    set miniaturized of front window to true
end tell"#,
            );
        }
        return Ok(());
    }
    spawn_terminal_app(&line, minimize)
}

#[cfg(target_os = "macos")]
fn spawn_open_app(app_name: &str, cwd: &str, command: &str, minimize: bool) -> Result<(), String> {
    let line = build_shell_line(cwd, command);
    if Command::new("open")
        .arg("-na")
        .arg(app_name)
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
    {
        return spawn_terminal_app(&line, minimize);
    }
    Err(format!("Could not open {}", app_name))
}

pub fn spawn_in_terminal(
    terminal_id: &str,
    cwd: &str,
    command: &str,
    minimize: bool,
) -> Result<(), String> {
    let path = Path::new(cwd);
    if !path.is_dir() {
        return Err(format!("Project path does not exist: {}", cwd));
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = (terminal_id, minimize);
        return Err("Terminal run is only supported on macOS".to_string());
    }

    #[cfg(target_os = "macos")]
    {
        let line = build_shell_line(cwd, command);
        let def = find_terminal_def(terminal_id).unwrap_or(&TERMINAL_DEFS[TERMINAL_DEFS.len() - 1]);
        if !terminal_installed(def) {
            return spawn_terminal_app(&line, minimize);
        }

        let result = match def.id {
            "iterm" => spawn_iterm(&line, minimize),
            "terminal" => spawn_terminal_app(&line, minimize),
            "warp" => spawn_warp(cwd, command, minimize),
            "ghostty" => spawn_ghostty(cwd, command, minimize),
            "wezterm" => spawn_open_app("WezTerm", cwd, command, minimize),
            "alacritty" => spawn_open_app("Alacritty", cwd, command, minimize),
            "kitty" => spawn_open_app("kitty", cwd, command, minimize),
            _ => spawn_terminal_app(&line, minimize),
        };

        result.or_else(|_| spawn_terminal_app(&line, minimize))
    }
}

pub fn test_terminal(terminal_id: &str, minimize: bool) -> Result<(), String> {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
    spawn_in_terminal(
        terminal_id,
        &home,
        "echo 'myDevDock — terminal OK'",
        minimize,
    )
}

fn detect_package_manager(path: &Path) -> Option<String> {
    if path.join("bun.lockb").exists() || path.join("bun.lock").exists() {
        return Some("bun".to_string());
    }
    if path.join("pnpm-lock.yaml").exists() {
        return Some("pnpm".to_string());
    }
    if path.join("yarn.lock").exists() {
        return Some("yarn".to_string());
    }
    if path.join("package-lock.json").exists() || path.join("package.json").exists() {
        return Some("npm".to_string());
    }
    None
}

fn read_package_scripts(path: &Path) -> Option<serde_json::Map<String, serde_json::Value>> {
    let pkg_path = path.join("package.json");
    let raw = std::fs::read_to_string(pkg_path).ok()?;
    let json: serde_json::Value = serde_json::from_str(&raw).ok()?;
    json.get("scripts")?.as_object().cloned()
}

fn pick_npm_script(scripts: &serde_json::Map<String, serde_json::Value>) -> Option<String> {
    for key in SCRIPT_PRIORITY {
        if scripts.contains_key(*key) {
            return Some((*key).to_string());
        }
    }
    None
}

fn detect_node_command(path: &Path) -> Option<(String, String, String)> {
    let scripts = read_package_scripts(path)?;
    let script_name = pick_npm_script(&scripts)?;
    let pm = detect_package_manager(path).unwrap_or_else(|| "npm".to_string());
    let command = format!("{} run {}", pm, script_name);
    Some((command, script_name, pm))
}

fn detect_python_command(path: &Path) -> Option<(String, String, String)> {
    if path.join("manage.py").exists() {
        return Some((
            "python manage.py runserver".to_string(),
            "runserver".to_string(),
            "python".to_string(),
        ));
    }
    if path.join("pyproject.toml").exists() || path.join("requirements.txt").exists() {
        if path.join("main.py").exists() {
            return Some((
                "uvicorn main:app --reload".to_string(),
                "uvicorn".to_string(),
                "python".to_string(),
            ));
        }
    }
    None
}

fn detect_rust_command(path: &Path) -> Option<(String, String, String)> {
    if path.join("Cargo.toml").exists() {
        return Some((
            "cargo run".to_string(),
            "run".to_string(),
            "cargo".to_string(),
        ));
    }
    None
}

fn detect_go_command(path: &Path) -> Option<(String, String, String)> {
    if path.join("go.mod").exists() {
        return Some(("go run .".to_string(), "run".to_string(), "go".to_string()));
    }
    None
}

pub fn resolve_run_command(path: &str, custom: Option<&str>) -> RunCommandResolution {
    if let Some(cmd) = custom.filter(|s| !s.trim().is_empty()) {
        return RunCommandResolution {
            command: Some(cmd.trim().to_string()),
            script_name: None,
            package_manager: None,
            source: "custom".to_string(),
            confidence: "high".to_string(),
        };
    }

    let path_obj = Path::new(path);
    if let Some((command, script_name, pm)) = detect_node_command(path_obj) {
        return RunCommandResolution {
            command: Some(command),
            script_name: Some(script_name),
            package_manager: Some(pm),
            source: "detected".to_string(),
            confidence: "high".to_string(),
        };
    }
    if let Some((command, script_name, pm)) = detect_python_command(path_obj) {
        return RunCommandResolution {
            command: Some(command),
            script_name: Some(script_name),
            package_manager: Some(pm),
            source: "detected".to_string(),
            confidence: "medium".to_string(),
        };
    }
    if let Some((command, script_name, pm)) = detect_rust_command(path_obj) {
        return RunCommandResolution {
            command: Some(command),
            script_name: Some(script_name),
            package_manager: Some(pm),
            source: "detected".to_string(),
            confidence: "high".to_string(),
        };
    }
    if let Some((command, script_name, pm)) = detect_go_command(path_obj) {
        return RunCommandResolution {
            command: Some(command),
            script_name: Some(script_name),
            package_manager: Some(pm),
            source: "detected".to_string(),
            confidence: "high".to_string(),
        };
    }

    RunCommandResolution {
        command: None,
        script_name: None,
        package_manager: None,
        source: "none".to_string(),
        confidence: "low".to_string(),
    }
}

pub fn run_projects_with_delay(
    terminal_id: &str,
    minimize: bool,
    delay_ms: i32,
    items: Vec<(String, String, String, String)>, // id, name, path, command
) -> Vec<RunProjectResult> {
    let mut results = Vec::new();
    for (idx, (project_id, project_name, path, command)) in items.into_iter().enumerate() {
        if idx > 0 && delay_ms > 0 {
            thread::sleep(Duration::from_millis(delay_ms as u64));
        }
        match spawn_in_terminal(terminal_id, &path, &command, minimize) {
            Ok(()) => results.push(RunProjectResult {
                project_id,
                project_name,
                command,
                terminal_id: terminal_id.to_string(),
                session_id: None,
                success: true,
                error: None,
            }),
            Err(err) => results.push(RunProjectResult {
                project_id,
                project_name,
                command,
                terminal_id: terminal_id.to_string(),
                session_id: None,
                success: false,
                error: Some(err),
            }),
        }
    }
    results
}
