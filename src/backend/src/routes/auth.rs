use axum::{extract::State, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sqlx::MySqlPool;
use uuid::Uuid;

use crate::error::AppError;

// ── DTOs ──────────────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterRequest {
    pub name:     String,
    pub email:    String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email:    String,
    pub password: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthResponse {
    pub id:    String,
    pub name:  String,
    pub email: String,
    pub token: String,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn hash_password(password: &str) -> String {
    let mut h = Sha256::new();
    h.update(password.as_bytes());
    format!("{:x}", h.finalize())
}

// ── Handlers ─────────────────────────────────────────────────────────────────

/// POST /api/auth/register
pub async fn register(
    State(pool): State<MySqlPool>,
    Json(req): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), AppError> {
    if req.name.trim().is_empty() {
        return Err(AppError::BadRequest("name is required".into()));
    }
    if req.password.len() < 8 {
        return Err(AppError::BadRequest("password must be at least 8 characters".into()));
    }

    // Check for duplicate email
    let exists: Option<(String,)> =
        sqlx::query_as("SELECT id FROM users WHERE email = ?")
            .bind(req.email.trim())
            .fetch_optional(&pool)
            .await?;

    if exists.is_some() {
        return Err(AppError::Conflict("email already registered".into()));
    }

    let id    = Uuid::new_v4().to_string();
    let token = Uuid::new_v4().to_string();
    let hash  = hash_password(&req.password);

    sqlx::query(
        "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(req.name.trim())
    .bind(req.email.trim())
    .bind(&hash)
    .execute(&pool)
    .await?;

    Ok((
        StatusCode::CREATED,
        Json(AuthResponse {
            id,
            name:  req.name.trim().to_string(),
            email: req.email.trim().to_string(),
            token,
        }),
    ))
}

/// POST /api/auth/login
pub async fn login(
    State(pool): State<MySqlPool>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let hash = hash_password(&req.password);

    let row: Option<(String, String, String)> = sqlx::query_as(
        "SELECT id, name, email FROM users WHERE email = ? AND password_hash = ?",
    )
    .bind(req.email.trim())
    .bind(&hash)
    .fetch_optional(&pool)
    .await?;

    match row {
        Some((id, name, email)) => Ok(Json(AuthResponse {
            id,
            name,
            email,
            token: Uuid::new_v4().to_string(),
        })),
        None => Err(AppError::Unauthorized),
    }
}
