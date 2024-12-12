use tauri::Manager;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;


#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UserInfo {
    pub username: String,
    pub display_name: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LoginState {
    pub is_logged_in: bool,
    pub user: Option<UserInfo>,
}

impl LoginState {
    fn new() -> Self {
        Self {
            is_logged_in: false,
            user: None,
        }
    }
}

fn get_auth_file_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let mut path = app_handle
        .path()
        .app_local_data_dir()
        .expect("Failed to get local data dir");
    path.push("auth.json");
    path
}

#[tauri::command]
pub async fn login(
    app_handle: tauri::AppHandle,
    username: String,
    password: String,
) -> Result<LoginState, String> {
    // 暂未实现用户模块
    if username == "admin" && password == "password" {
        let state = LoginState {
            is_logged_in: true,
            user: Some(UserInfo {
                username: username.clone(),
                display_name: "Administrator".to_string(),
            }),
        };

        if let Some(parent) = get_auth_file_path(&app_handle).parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }

        fs::write(
            get_auth_file_path(&app_handle),
            serde_json::to_string(&state).map_err(|e| e.to_string())?,
        )
        .map_err(|e| e.to_string())?;

        Ok(state)
    } else {
        Err("Invalid username or password".to_string())
    }
}

#[tauri::command]
pub async fn get_login_state(app_handle: tauri::AppHandle) -> LoginState {
    let path = get_auth_file_path(&app_handle);
    
    match fs::read_to_string(path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or(LoginState::new()),
        Err(_) => LoginState::new(),
    }
}

#[tauri::command]
pub async fn logout(app_handle: tauri::AppHandle) -> Result<(), String> {
    let path = get_auth_file_path(&app_handle);
    let state = LoginState::new();
    
    fs::write(path, serde_json::to_string(&state).unwrap())
        .map_err(|e| e.to_string())
}