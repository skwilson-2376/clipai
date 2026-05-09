use axum::{extract::State, Json};
use rand::Rng;
use serde::{Deserialize, Serialize};
use sqlx::MySqlPool;
use uuid::Uuid;

use crate::{error::AppError, models::Generation};

// ── Request / Response DTOs ──────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateRequest {
    pub prompt: String,
    pub style: String,
    pub aspect_ratio: String,
    pub platform: String,
    pub resolution: String,
    pub duration: i32,
    pub motion_intensity: i32,
    pub creativity: i32,
}

#[derive(Debug, Serialize)]
pub struct GenerateResponse {
    pub id: String,
}

// ── Handlers ─────────────────────────────────────────────────────────────────

/// POST /api/generate
pub async fn create(
    State(pool): State<MySqlPool>,
    Json(req): Json<GenerateRequest>,
) -> Result<Json<GenerateResponse>, AppError> {
    let id = Uuid::new_v4().to_string();
    let gradient = random_gradient();

    sqlx::query(
        "INSERT INTO generations
            (id, prompt, style, aspect_ratio, platform, resolution,
             duration, motion_intensity, creativity, status, progress, thumbnail_gradient)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?)",
    )
    .bind(&id)
    .bind(&req.prompt)
    .bind(&req.style)
    .bind(&req.aspect_ratio)
    .bind(&req.platform)
    .bind(&req.resolution)
    .bind(req.duration)
    .bind(req.motion_intensity)
    .bind(req.creativity)
    .bind(&gradient)
    .execute(&pool)
    .await?;

    // Kick off background simulation (replace with real AI call in production)
    let pool2 = pool.clone();
    let id2   = id.clone();
    tokio::spawn(async move { simulate_generation(pool2, id2).await });

    Ok(Json(GenerateResponse { id }))
}

/// GET /api/generations
pub async fn list(
    State(pool): State<MySqlPool>,
) -> Result<Json<Vec<Generation>>, AppError> {
    let rows = sqlx::query_as::<_, Generation>(
        "SELECT id, prompt, style, aspect_ratio, platform, resolution,
                duration, motion_intensity, creativity, status, progress,
                video_url, thumbnail_gradient, is_uploaded,
                DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%SZ') AS created_at
         FROM generations
         ORDER BY created_at DESC
         LIMIT 50",
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(rows))
}

// ── Simulation helper (replace with real AI pipeline) ────────────────────────

async fn simulate_generation(pool: MySqlPool, id: String) {
    use std::time::Duration;
    use tokio::time::sleep;

    let _ = sqlx::query(
        "UPDATE generations SET status = 'processing', progress = 5 WHERE id = ?",
    )
    .bind(&id)
    .execute(&pool)
    .await;

    // (delay_seconds, progress_percent)
    let steps: &[(u64, i32)] = &[(4, 20), (4, 42), (4, 63), (4, 82), (3, 96)];

    for &(delay, pct) in steps {
        sleep(Duration::from_secs(delay)).await;
        let _ = sqlx::query("UPDATE generations SET progress = ? WHERE id = ?")
            .bind(pct)
            .bind(&id)
            .execute(&pool)
            .await;
    }

    sleep(Duration::from_secs(2)).await;

    let _ = sqlx::query(
        "UPDATE generations SET status = 'done', progress = 100 WHERE id = ?",
    )
    .bind(&id)
    .execute(&pool)
    .await;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn random_gradient() -> &'static str {
    const GRADIENTS: &[&str] = &[
        "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
        "linear-gradient(135deg,#1f0036,#6a0057,#c60092)",
        "linear-gradient(135deg,#004d7a,#008793,#00bf72)",
        "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",
        "linear-gradient(135deg,#2d1b69,#11998e,#38ef7d)",
        "linear-gradient(135deg,#141e30,#243b55,#2980b9)",
    ];
    GRADIENTS[rand::thread_rng().gen_range(0..GRADIENTS.len())]
}
