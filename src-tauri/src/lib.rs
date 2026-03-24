use chrono::Local;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use tauri::Manager;
use walkdir::WalkDir;

// --- DTOs (JSON camelCase para el frontend) ---------------------------------

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GitStatus {
    pub branch: String,
    pub last_commit: String,
    pub status: String,
    pub changes_count: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProjectDetails {
    pub id: String,
    pub name: String,
    pub path: String,
    pub stack: Vec<String>,
    pub git: GitStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub probable_editor: Option<String>,
    pub added_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GroupRow {
    pub id: String,
    pub name: String,
    pub project_ids: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppSettingsDto {
    pub default_editor: String,
    pub git_poll_interval: i32,
    pub launch_delay: i32,
    pub sort_by: String,
    pub sort_direction: String,
}

impl Default for AppSettingsDto {
    fn default() -> Self {
        Self {
            default_editor: "cursor".to_string(),
            git_poll_interval: 5000,
            launch_delay: 1000,
            sort_by: "name".to_string(),
            sort_direction: "asc".to_string(),
        }
    }
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PartialAppSettings {
    pub default_editor: Option<String>,
    pub git_poll_interval: Option<i32>,
    pub launch_delay: Option<i32>,
    pub sort_by: Option<String>,
    pub sort_direction: Option<String>,
}

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct PersistedState {
    projects: Vec<ProjectDetails>,
    groups: Vec<GroupRow>,
    settings: AppSettingsDto,
}

// --- Estado -------------------------------------------------------------------

pub struct AppState {
    projects: Mutex<Vec<ProjectDetails>>,
    groups: Mutex<Vec<GroupRow>>,
    settings: Mutex<AppSettingsDto>,
    data_file: PathBuf,
}

impl AppState {
    fn from_data_file(data_file: PathBuf) -> Self {
        let persisted = load_persisted_state(&data_file).unwrap_or_default();
        Self {
            projects: Mutex::new(persisted.projects),
            groups: Mutex::new(persisted.groups),
            settings: Mutex::new(persisted.settings),
            data_file,
        }
    }
}

// --- Utilidades ---------------------------------------------------------------

fn generate_id(path: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    path.hash(&mut hasher);
    format!("{:x}", hasher.finish())
}

fn run_git(args: &[&str], cwd: &Path) -> Option<String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(cwd)
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    String::from_utf8(output.stdout)
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

fn read_git_info(project_path: &Path) -> GitStatus {
    let git_dir = project_path.join(".git");
    if !git_dir.exists() {
        return GitStatus {
            branch: "—".to_string(),
            last_commit: "—".to_string(),
            status: "clean".to_string(),
            changes_count: 0,
        };
    }

    let branch = run_git(&["rev-parse", "--abbrev-ref", "HEAD"], project_path)
        .unwrap_or_else(|| "main".to_string());
    let last_commit = run_git(&["log", "-1", "--pretty=%s"], project_path)
        .unwrap_or_else(|| "—".to_string());

    let changes_count = run_git(&["status", "--porcelain"], project_path)
        .map(|s| s.lines().filter(|l| !l.trim().is_empty()).count() as i32)
        .unwrap_or(0);

    let status = if changes_count > 0 {
        "uncommitted"
    } else {
        "clean"
    };

    GitStatus {
        branch,
        last_commit,
        status: status.to_string(),
        changes_count,
    }
}

fn is_monorepo(path: &Path) -> bool {
    path.join("nx.json").exists()
        || path.join("turbo.json").exists()
        || path.join("pnpm-workspace.yaml").exists()
        || path.join("bun.lock").exists()
}

fn is_project_root(path: &Path) -> bool {
    path.join("package.json").exists()
        || path.join("Cargo.toml").exists()
        || path.join("go.mod").exists()
        || path.join("requirements.txt").exists()
        || path.join("pyproject.toml").exists()
        || path.join("composer.json").exists()
        || path.join("Gemfile").exists()
        || path.join(".git").exists()
}

fn add_stack(stack: &mut Vec<String>, value: &str) {
    if !stack.iter().any(|s| s == value) {
        stack.push(value.to_string());
    }
}

fn package_has_dep(package_json: &str, dep: &str) -> bool {
    let patterns = [
        format!("\"{}\":", dep),
        format!("\"@types/{}\":", dep),
        format!("\"@{}/", dep),
    ];
    patterns.iter().any(|p| package_json.contains(p))
}

fn detect_node_stack(path: &Path, stack: &mut Vec<String>) {
    let package_json_path = path.join("package.json");
    if !package_json_path.exists() {
        return;
    }

    add_stack(stack, "javascript");

    if path.join("tsconfig.json").exists()
        || path.join("tsconfig.app.json").exists()
        || path.join("tsconfig.base.json").exists()
    {
        add_stack(stack, "typescript");
    }

    if let Ok(package_json) = fs::read_to_string(package_json_path) {
        if package_has_dep(&package_json, "react") {
            add_stack(stack, "react");
        }
        if package_has_dep(&package_json, "@angular/core") {
            add_stack(stack, "angular");
        }
        if package_has_dep(&package_json, "vue") {
            add_stack(stack, "vue");
        }
        if package_has_dep(&package_json, "next") {
            add_stack(stack, "nextjs");
        }
        if package_has_dep(&package_json, "nuxt") {
            add_stack(stack, "nuxt");
        }
        if package_has_dep(&package_json, "svelte") {
            add_stack(stack, "svelte");
        }
        if package_has_dep(&package_json, "express") {
            add_stack(stack, "express");
            add_stack(stack, "node");
        }
        if package_has_dep(&package_json, "@nestjs/core") {
            add_stack(stack, "nestjs");
            add_stack(stack, "node");
        }
        if package_has_dep(&package_json, "graphql") || package_has_dep(&package_json, "@apollo/server")
        {
            add_stack(stack, "graphql");
        }
        if package_has_dep(&package_json, "tailwindcss") {
            add_stack(stack, "tailwindcss");
        }
        if package_has_dep(&package_json, "vite") {
            add_stack(stack, "vite");
        }
        if package_has_dep(&package_json, "webpack") {
            add_stack(stack, "webpack");
        }
        if package_has_dep(&package_json, "mongoose") || package_has_dep(&package_json, "mongodb") {
            add_stack(stack, "mongodb");
        }
        if package_has_dep(&package_json, "pg") || package_has_dep(&package_json, "postgres") {
            add_stack(stack, "postgresql");
        }
        if package_has_dep(&package_json, "redis") || package_has_dep(&package_json, "ioredis") {
            add_stack(stack, "redis");
        }
    }
}

fn detect_python_stack(path: &Path, stack: &mut Vec<String>) {
    let req_path = path.join("requirements.txt");
    let pyproject_path = path.join("pyproject.toml");
    if !req_path.exists() && !pyproject_path.exists() {
        return;
    }

    add_stack(stack, "python");

    if let Ok(req) = fs::read_to_string(&req_path) {
        let lowered = req.to_lowercase();
        if lowered.contains("django") {
            add_stack(stack, "django");
        }
        if lowered.contains("flask") {
            add_stack(stack, "flask");
        }
        if lowered.contains("fastapi") {
            add_stack(stack, "fastapi");
        }
    }

    if let Ok(pyproject) = fs::read_to_string(&pyproject_path) {
        let lowered = pyproject.to_lowercase();
        if lowered.contains("django") {
            add_stack(stack, "django");
        }
        if lowered.contains("flask") {
            add_stack(stack, "flask");
        }
        if lowered.contains("fastapi") {
            add_stack(stack, "fastapi");
        }
    }
}

fn detect_other_stack(path: &Path, stack: &mut Vec<String>) {
    if path.join("Cargo.toml").exists() {
        add_stack(stack, "rust");
    }
    if path.join("go.mod").exists() {
        add_stack(stack, "go");
    }
    if path.join("Gemfile").exists() {
        add_stack(stack, "ruby");
        add_stack(stack, "rails");
    }
    if path.join("pom.xml").exists() || path.join("build.gradle").exists() || path.join("build.gradle.kts").exists()
    {
        add_stack(stack, "java");
    }
    if path.join("build.gradle.kts").exists() {
        add_stack(stack, "kotlin");
    }
    if path.join("nx.json").exists() {
        add_stack(stack, "nx");
    }
    if path.join("vite.config.ts").exists() || path.join("vite.config.js").exists() {
        add_stack(stack, "vite");
    }
    if path.join("webpack.config.js").exists() || path.join("webpack.config.ts").exists() {
        add_stack(stack, "webpack");
    }
    if path.join("Dockerfile").exists() || path.join("docker-compose.yml").exists() {
        add_stack(stack, "docker");
    }
    if path.join("k8s").exists() || path.join("kubernetes").exists() || path.join("helm").exists() {
        add_stack(stack, "kubernetes");
    }
    if path.join("main.tf").exists() || path.join("terraform").exists() {
        add_stack(stack, "terraform");
    }
    if path.join("pubspec.yaml").exists() {
        add_stack(stack, "flutter");
        add_stack(stack, "dart");
    }
    if path.join("Package.swift").exists() || path.join("project.pbxproj").exists() {
        add_stack(stack, "swift");
    }
}

fn build_project_details(path: &Path) -> Option<ProjectDetails> {
    let name = path.file_name()?.to_str()?.to_string();
    let path_str = path.to_str()?.to_string();
    let mut stack = Vec::new();
    detect_node_stack(path, &mut stack);
    detect_python_stack(path, &mut stack);
    detect_other_stack(path, &mut stack);

    let git = read_git_info(path);
    let probable_editor = detect_probable_editor(path);

    Some(ProjectDetails {
        id: generate_id(&path_str),
        name,
        path: path_str,
        stack,
        git,
        probable_editor,
        added_at: Local::now().to_rfc3339(),
    })
}

fn merge_unique_by_id(into: &mut Vec<ProjectDetails>, items: &[ProjectDetails]) {
    for p in items {
        if !into.iter().any(|x| x.id == p.id) {
            into.push(p.clone());
        }
    }
}

fn load_persisted_state(file_path: &Path) -> Result<PersistedState, String> {
    if !file_path.exists() {
        return Ok(PersistedState::default());
    }
    let raw = fs::read_to_string(file_path).map_err(|e| format!("Failed to read state: {}", e))?;
    if raw.trim().is_empty() {
        return Ok(PersistedState::default());
    }
    serde_json::from_str::<PersistedState>(&raw).map_err(|e| format!("Invalid persisted state: {}", e))
}

fn persist_state(state: &AppState) -> Result<(), String> {
    if let Some(parent) = state.data_file.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed creating app data dir: {}", e))?;
    }

    let projects = state.projects.lock().map_err(|e| e.to_string())?.clone();
    let groups = state.groups.lock().map_err(|e| e.to_string())?.clone();
    let settings = state.settings.lock().map_err(|e| e.to_string())?.clone();

    let snapshot = PersistedState {
        projects,
        groups,
        settings,
    };
    let payload =
        serde_json::to_string_pretty(&snapshot).map_err(|e| format!("Failed serializing state: {}", e))?;
    fs::write(&state.data_file, payload).map_err(|e| format!("Failed writing state: {}", e))
}

fn resolve_state_file(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed resolving app data directory: {}", e))?;
    fs::create_dir_all(&app_data_dir).map_err(|e| format!("Failed creating app data directory: {}", e))?;
    Ok(app_data_dir.join("dev-hub-state.json"))
}

fn open_with_editor(path: &str, editor: &str) -> Result<(), String> {
    let key = editor.to_lowercase();
    let binary = match key.as_str() {
        "cursor" => "cursor",
        "antigravity" => "antigravity",
        "vscode" => "code",
        "zed" => "zed",
        "webstorm" => "webstorm",
        "sublime" => "subl",
        "neovim" => "nvim",
        _ => "cursor",
    };

    if Command::new(binary).arg(path).spawn().is_ok() {
        return Ok(());
    }

    open::that(path).map_err(|e| format!("Failed to open path: {}", e))
}

fn detect_probable_editor(path: &Path) -> Option<String> {
    if path.join(".cursor").exists() {
        return Some("cursor".to_string());
    }
    if path.join(".vscode").exists() {
        return Some("vscode".to_string());
    }
    if path.join(".zed").exists() {
        return Some("zed".to_string());
    }
    if path.join(".idea").exists() {
        return Some("webstorm".to_string());
    }
    if path.join(".antigravity").exists() {
        return Some("antigravity".to_string());
    }
    None
}

fn is_command_available(command: &str) -> bool {
    Command::new(command)
        .arg("--version")
        .output()
        .map(|out| out.status.success())
        .unwrap_or(false)
}

fn is_editor_installed(editor_id: &str) -> bool {
    let command_available = match editor_id {
        "cursor" => is_command_available("cursor"),
        "antigravity" => is_command_available("antigravity"),
        "vscode" => is_command_available("code"),
        "zed" => is_command_available("zed"),
        "webstorm" => is_command_available("webstorm"),
        "sublime" => is_command_available("subl"),
        "neovim" => is_command_available("nvim"),
        _ => false,
    };

    if command_available {
        return true;
    }

    #[cfg(target_os = "macos")]
    {
        let app_candidates: &[&str] = match editor_id {
            "cursor" => &["/Applications/Cursor.app"],
            "antigravity" => &["/Applications/Antigravity.app"],
            "vscode" => &["/Applications/Visual Studio Code.app"],
            "zed" => &["/Applications/Zed.app"],
            "webstorm" => &["/Applications/WebStorm.app"],
            "sublime" => &["/Applications/Sublime Text.app"],
            _ => &[],
        };
        return app_candidates.iter().any(|p| Path::new(p).exists());
    }

    #[cfg(not(target_os = "macos"))]
    {
        false
    }
}

// --- Comandos -----------------------------------------------------------------

#[tauri::command]
fn get_projects(state: tauri::State<'_, AppState>) -> Result<Vec<ProjectDetails>, String> {
    let guard = state.projects.lock().map_err(|e| e.to_string())?;
    Ok(guard.clone())
}

#[tauri::command]
fn get_groups(state: tauri::State<'_, AppState>) -> Result<Vec<GroupRow>, String> {
    let guard = state.groups.lock().map_err(|e| e.to_string())?;
    Ok(guard.clone())
}

#[tauri::command]
fn get_settings(state: tauri::State<'_, AppState>) -> Result<AppSettingsDto, String> {
    let guard = state.settings.lock().map_err(|e| e.to_string())?;
    Ok(guard.clone())
}

#[tauri::command]
fn update_settings(
    state: tauri::State<'_, AppState>,
    settings: PartialAppSettings,
) -> Result<AppSettingsDto, String> {
    let mut guard = state.settings.lock().map_err(|e| e.to_string())?;
    if let Some(v) = settings.default_editor {
        if !v.is_empty() {
            guard.default_editor = v;
        }
    }
    if let Some(v) = settings.git_poll_interval {
        if v > 0 {
            guard.git_poll_interval = v;
        }
    }
    if let Some(v) = settings.launch_delay {
        if v >= 0 {
            guard.launch_delay = v;
        }
    }
    if let Some(v) = settings.sort_by {
        if !v.is_empty() {
            guard.sort_by = v;
        }
    }
    if let Some(v) = settings.sort_direction {
        if !v.is_empty() {
            guard.sort_direction = v;
        }
    }
    let updated = guard.clone();
    drop(guard);
    persist_state(&state)?;
    Ok(updated)
}

#[tauri::command]
async fn register_project(
    state: tauri::State<'_, AppState>,
    path: String,
) -> Result<ProjectDetails, String> {
    let path_obj = Path::new(&path);
    if !path_obj.exists() {
        return Err("Path does not exist".to_string());
    }
    let details =
        build_project_details(path_obj).ok_or_else(|| "Could not read project details".to_string())?;

    let mut guard = state.projects.lock().map_err(|e| e.to_string())?;
    if let Some(i) = guard.iter().position(|p| p.path == details.path) {
        guard[i] = details.clone();
    } else {
        guard.push(details.clone());
    }
    persist_state(&state)?;
    Ok(details)
}

#[tauri::command]
async fn scan_directory(
    state: tauri::State<'_, AppState>,
    base_path: String,
) -> Result<Vec<ProjectDetails>, String> {
    let base = Path::new(&base_path);
    if !base.exists() || !base.is_dir() {
        return Err("Invalid directory path".to_string());
    }

    let mut found: Vec<ProjectDetails> = Vec::new();
    let walker = WalkDir::new(base)
        .min_depth(1)
        .max_depth(5)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_str().unwrap_or("");
            name != "node_modules"
                && name != "target"
                && name != ".git"
                && name != "dist"
                && name != "build"
        });

    for entry in walker {
        let e = entry.map_err(|err| err.to_string())?;
        let path = e.path();
        if path.is_dir() && (is_monorepo(path) || is_project_root(path)) {
            if let Some(details) = build_project_details(path) {
                found.push(details);
            }
        }
    }

    let changed;
    {
        let mut guard = state.projects.lock().map_err(|e| e.to_string())?;
        let before = guard.len();
        merge_unique_by_id(&mut guard, &found);
        changed = guard.len() != before;
    }

    if changed {
        persist_state(&state)?;
    }

    Ok(found)
}

#[tauri::command]
fn remove_project(state: tauri::State<'_, AppState>, id: String) -> Result<(), String> {
    let mut guard = state.projects.lock().map_err(|e| e.to_string())?;
    guard.retain(|p| p.id != id);
    drop(guard);
    persist_state(&state)?;
    Ok(())
}

#[tauri::command]
async fn open_in_editor(path: String, editor: String) -> Result<(), String> {
    open_with_editor(&path, &editor)
}

#[tauri::command]
fn get_installed_editors() -> Result<Vec<String>, String> {
    let candidates = [
        "cursor",
        "antigravity",
        "vscode",
        "zed",
        "webstorm",
        "sublime",
        "neovim",
    ];
    let installed = candidates
        .iter()
        .filter(|id| is_editor_installed(id))
        .map(|id| id.to_string())
        .collect::<Vec<_>>();
    Ok(installed)
}

#[tauri::command]
async fn launch_project(state: tauri::State<'_, AppState>, path: String) -> Result<(), String> {
    let default_editor = state
        .settings
        .lock()
        .map_err(|e| e.to_string())?
        .default_editor
        .clone();
    open_with_editor(&path, &default_editor)
}

#[tauri::command]
async fn launch_group(state: tauri::State<'_, AppState>, group_id: String) -> Result<(), String> {
    let (group, projects, settings) = {
        let groups = state.groups.lock().map_err(|e| e.to_string())?.clone();
        let projects = state.projects.lock().map_err(|e| e.to_string())?.clone();
        let settings = state.settings.lock().map_err(|e| e.to_string())?.clone();
        let group = groups
            .into_iter()
            .find(|g| g.id == group_id)
            .ok_or_else(|| "Group not found".to_string())?;
        (group, projects, settings)
    };

    let mut launched = 0;
    for project_id in &group.project_ids {
        if let Some(project) = projects.iter().find(|p| p.id == *project_id) {
            open_with_editor(&project.path, &settings.default_editor)?;
            launched += 1;
            if settings.launch_delay > 0 {
                thread::sleep(Duration::from_millis(settings.launch_delay as u64));
            }
        }
    }

    if launched == 0 {
        return Err("Group has no valid projects to launch".to_string());
    }

    Ok(())
}

#[tauri::command]
fn sync_project(state: tauri::State<'_, AppState>, id: String) -> Result<ProjectDetails, String> {
    let mut guard = state.projects.lock().map_err(|e| e.to_string())?;
    let idx = guard
        .iter()
        .position(|p| p.id == id)
        .ok_or_else(|| "Project not found".to_string())?;
    let path = Path::new(&guard[idx].path);
    let git = read_git_info(path);
    guard[idx].git = git;
    let project = guard[idx].clone();
    drop(guard);
    persist_state(&state)?;
    Ok(project)
}

#[tauri::command]
async fn create_group(
    state: tauri::State<'_, AppState>,
    name: String,
    project_ids: Vec<String>,
) -> Result<GroupRow, String> {
    let group = GroupRow {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        project_ids,
        color: None,
    };
    let mut guard = state.groups.lock().map_err(|e| e.to_string())?;
    guard.push(group.clone());
    drop(guard);
    persist_state(&state)?;
    Ok(group)
}

#[tauri::command]
fn update_group(state: tauri::State<'_, AppState>, group: GroupRow) -> Result<GroupRow, String> {
    let mut guard = state.groups.lock().map_err(|e| e.to_string())?;
    let idx = guard
        .iter()
        .position(|g| g.id == group.id)
        .ok_or_else(|| "Group not found".to_string())?;
    guard[idx] = group.clone();
    drop(guard);
    persist_state(&state)?;
    Ok(group)
}

#[tauri::command]
fn delete_group(state: tauri::State<'_, AppState>, id: String) -> Result<(), String> {
    let mut guard = state.groups.lock().map_err(|e| e.to_string())?;
    let before = guard.len();
    guard.retain(|g| g.id != id);
    if guard.len() == before {
        return Err("Group not found".to_string());
    }
    drop(guard);
    persist_state(&state)?;
    Ok(())
}

#[tauri::command]
fn clear_all(state: tauri::State<'_, AppState>) -> Result<(), String> {
    {
        let mut projects = state.projects.lock().map_err(|e| e.to_string())?;
        projects.clear();
    }
    {
        let mut groups = state.groups.lock().map_err(|e| e.to_string())?;
        groups.clear();
    }
    persist_state(&state)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let state_file = resolve_state_file(app.handle())?;
            let state = AppState::from_data_file(state_file);
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_projects,
            get_groups,
            get_settings,
            update_settings,
            scan_directory,
            register_project,
            remove_project,
            get_installed_editors,
            open_in_editor,
            launch_project,
            launch_group,
            sync_project,
            create_group,
            update_group,
            delete_group,
            clear_all,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
