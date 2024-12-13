use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPoolOptions;
use sqlx::Error;
use sqlx::{Pool, Postgres, Row};
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize)]
pub struct Point {
    pub id: i64,
    pub data_time: i64,
    pub loc_type: i16,
    pub longitude: f64,
    pub latitude: f64,
    pub heading: Option<f64>,
    pub accuracy: Option<f64>,
    pub speed: Option<f64>,
    pub distance: Option<f64>,
    pub is_back_foreground: i16,
    pub step_type: i16,
    pub altitude: Option<f64>,
}

pub struct DbConnection {
    pool: Pool<Postgres>,
}

impl DbConnection {
    pub async fn new() -> Result<Self, sqlx::Error> {
        let database_url = "postgres://default:toH1xYSMfEW6@ep-green-tree-a43jhf6a.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require";

        let pool = PgPoolOptions::new()
            .max_connections(5)
            .acquire_timeout(Duration::from_secs(3))
            .connect(database_url)
            .await?;

        sqlx::query("SELECT 1").execute(&pool).await?;

        Ok(Self { pool })
    }

    pub async fn get_track_data(
        &self,
        start_time: i64,
        end_time: i64,
    ) -> Result<Vec<Point>, Error> {
        println!("查询时间范围: {} 到 {}", start_time, end_time);

        let mut retries = 3;
        while retries > 0 {
            match sqlx::query(
                r#"
                SELECT 
                    id, data_time, loc_type, 
                    longitude::float8 as longitude,
                    latitude::float8 as latitude,
                    heading::float8 as heading,
                    accuracy::float8 as accuracy,
                    speed::float8 as speed,
                    distance::float8 as distance,
                    is_back_foreground, step_type,
                    altitude::float8 as altitude
                FROM lifetime 
                WHERE data_time BETWEEN $1 AND $2 
                ORDER BY data_time ASC
                "#,
            )
            .bind(start_time)
            .bind(end_time)
            .try_map(|row: sqlx::postgres::PgRow| {
                Ok(Point {
                    id: row.get("id"),
                    data_time: row.get("data_time"),
                    loc_type: row.get("loc_type"),
                    longitude: row.get("longitude"),
                    latitude: row.get("latitude"),
                    heading: row.get("heading"),
                    accuracy: row.get("accuracy"),
                    speed: row.get("speed"),
                    distance: row.get("distance"),
                    is_back_foreground: row.get("is_back_foreground"),
                    step_type: row.get("step_type"),
                    altitude: row.get("altitude"),
                })
            })
            .fetch_all(&self.pool)
            .await
            {
                Ok(results) => {
                    println!("查询成功，返回 {} 条记录", results.len());
                    return Ok(results);
                }
                Err(e) => {
                    println!("查询错误 (剩余重试次数: {}): {:?}", retries - 1, e);
                    retries -= 1;
                    if retries == 0 {
                        return Err(e);
                    }
                    tokio::time::sleep(std::time::Duration::from_millis(500)).await;
                }
            }
        }
        Err(Error::PoolTimedOut)
    }
}
