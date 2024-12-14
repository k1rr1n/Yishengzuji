use serde::{Deserialize, Serialize};
use sqlx::{Pool, Postgres, Row};

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
        let database_url = "postgres://zhangyiyang:040724@localhost:5432/postgres";
        // let database_url = "postgres://default:toH1xYSMfEW6@ep-green-tree-a43jhf6a.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require";
        let pool = match sqlx::postgres::PgPoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await
        {
            Ok(pool) => {
                println!("成功连接数据库");
                pool
            }
            Err(e) => {
                println!("数据库连接失败: {:?}", e);
                return Err(e);
            }
        };

        Ok(Self { pool })
    }

    pub async fn get_track_data(
        &self,
        start_time: i64,
        end_time: i64,
    ) -> Result<Vec<Point>, sqlx::Error> {
        let result = sqlx::query(
            r#"
                select 
                    id, data_time, loc_type, 
                    longitude::float8 as longitude,
                    latitude::float8 as latitude,
                    heading::float8 as heading,
                    accuracy::float8 as accuracy,
                    speed::float8 as speed,
                    distance::float8 as distance,
                    is_back_foreground, step_type,
                    altitude::float8 as altitude
                from lifetime 
                where data_time between $1 and $2 
                order by data_time asc
                "#,
        )
        .bind(start_time)
        .bind(end_time)
        .map(|row: sqlx::postgres::PgRow| Point {
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
        .fetch_all(&self.pool)
        .await;

        match &result {
            Ok(points) => println!("轨迹数据查询成功，查询到{}个轨迹点", points.len()),
            Err(e) => println!("轨迹数据查询失败: {:?}", e),
        }

        result
    }

    pub async fn get_total_distance(
        &self,
        start_time: i64,
        end_time: i64,
    ) -> Result<f64, sqlx::Error> {
        let result = sqlx::query(r#"
            select coalesce(sum(case when distance is null or distance = 0 then 0 else distance::float8 end), 0)::float8 as total_distance
            from lifetime where data_time between $1 and $2
        "#,)
        .bind(start_time)
        .bind(end_time)
        .fetch_one(&self.pool)
        .await
        .map(|row| row.get::<f64, _>("total_distance"));

        match &result {
            Ok(distance) => println!("距离计算成功，{}米", distance),
            Err(e) => println!("距离计算失败, {:?}", e),
        }

        result
    }
}
