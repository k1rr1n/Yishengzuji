use crate::db::{DbConnection, Point};
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;

// 线程安全的数据库连接
// Arc 允许多线程共享数据  Mutex 确保同一时间只有一个线程可以访问数据库连接（锁）
pub type DbState = Arc<Mutex<DbConnection>>;

#[tauri::command]
pub async fn get_track_data(
    start_time: i64,
    end_time: i64,
    db: State<'_, DbState>, // State: tauri的状态管理，允许在不同的命令处理器间共享数据库连接
) -> Result<Vec<Point>, String> {
    let db = db.lock().await;
    match db.get_track_data(start_time, end_time).await {
        Ok(data) => Ok(data),
        Err(e) => {
            let error_msg = format!("error fetch track data: {:?}", e);
            println!("{}", error_msg);
            Err(error_msg)
        }
    }
}

#[tauri::command]
pub async fn get_total_distance(
    start_time: i64,
    end_time: i64,
    db: State<'_, DbState>,
) -> Result<f64, String> {
    let db = db.lock().await;
    match db.get_total_distance(start_time, end_time).await {
        Ok(total) => Ok(total),
        Err(e) => {
            let error_msg = format!("error calc total distance: {:?}", e);
            println!("{}", error_msg);
            Err(error_msg)
        }
    }
}
