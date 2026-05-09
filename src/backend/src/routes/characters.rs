use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::Deserialize;
use sqlx::MySqlPool;
use uuid::Uuid;

use crate::{error::AppError, models::Character};

// ── DTOs ──────────────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCharacterRequest {
    pub name: String,
    pub source: String,           // "ai" | "uploaded"
    pub image_url: Option<String>,
    pub description: Option<String>,
    pub gradient: String,
}

// ── Handlers ─────────────────────────────────────────────────────────────────

/// GET /api/characters
pub async fn list(
    State(pool): State<MySqlPool>,
) -> Result<Json<Vec<Character>>, AppError> {
    let rows = sqlx::query_as::<_, Character>(
        "SELECT id, name, source, image_url, description, gradient,
                DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%SZ') AS created_at
         FROM characters
         ORDER BY created_at DESC",
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(rows))
}

/// POST /api/characters
pub async fn create(
    State(pool): State<MySqlPool>,
    Json(req): Json<CreateCharacterRequest>,
) -> Result<(StatusCode, Json<Character>), AppError> {
    if req.name.trim().is_empty() {
        return Err(AppError::BadRequest("name is required".into()));
    }
    if req.source != "ai" && req.source != "uploaded" {
        return Err(AppError::BadRequest("source must be 'ai' or 'uploaded'".into()));
    }

    let id = Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO characters (id, name, source, image_url, description, gradient)
         VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(req.name.trim())
    .bind(&req.source)
    .bind(&req.image_url)
    .bind(&req.description)
    .bind(&req.gradient)
    .execute(&pool)
    .await?;

    let char = sqlx::query_as::<_, Character>(
        "SELECT id, name, source, image_url, description, gradient,
                DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%SZ') AS created_at
         FROM characters WHERE id = ?",
    )
    .bind(&id)
    .fetch_one(&pool)
    .await?;

    Ok((StatusCode::CREATED, Json(char)))
}

/// DELETE /api/characters/:id
pub async fn delete(
    Path(id): Path<String>,
    State(pool): State<MySqlPool>,
) -> Result<StatusCode, AppError> {
    let result = sqlx::query("DELETE FROM characters WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(StatusCode::NO_CONTENT)
}
