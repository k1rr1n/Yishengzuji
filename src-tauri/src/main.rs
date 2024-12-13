// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;
mod command;
mod db;

use auth::{get_login_state, login, logout};
use command::{get_total_distance, get_track_data};
use db::DbConnection;
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main] // 创建tokio运行时环境，自动管理异步任务调度
async fn main() {
    let db = DbConnection::new()
        .await
        .expect("failed to connect vercel pg");

    let db_state = Arc::new(Mutex::new(db));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(db_state)
        .invoke_handler(tauri::generate_handler![
            login,
            logout,
            get_login_state,
            get_track_data,
            get_total_distance,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
