use axum::{extract::State, http::{HeaderMap, StatusCode}, Json};
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
    pub role:  String,
    pub token: String,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn hash_password(password: &str) -> String {
    let mut h = Sha256::new();
    h.update(password.as_bytes());
    format!("{:x}", h.finalize())
}

fn extract_bearer(headers: &HeaderMap) -> Option<String> {
    headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer ").map(str::to_string))
}

async fn create_session(pool: &MySqlPool, user_id: &str) -> Result<String, AppError> {
    let token = Uuid::new_v4().to_string();
    // 90-day sessions
    sqlx::query(
        "INSERT INTO sessions (token, user_id, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 90 DAY))",
    )
    .bind(&token)
    .bind(user_id)
    .execute(pool)
    .await?;
    Ok(token)
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

    let exists: Option<(String,)> =
        sqlx::query_as("SELECT id FROM users WHERE email = ?")
            .bind(req.email.trim())
            .fetch_optional(&pool)
            .await?;

    if exists.is_some() {
        return Err(AppError::Conflict("email already registered".into()));
    }

    let id   = Uuid::new_v4().to_string();
    let hash = hash_password(&req.password);

    sqlx::query(
        "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(req.name.trim())
    .bind(req.email.trim())
    .bind(&hash)
    .execute(&pool)
    .await?;

    let token = create_session(&pool, &id).await?;

    Ok((
        StatusCode::CREATED,
        Json(AuthResponse {
            id,
            name:  req.name.trim().to_string(),
            email: req.email.trim().to_string(),
            role:  "user".to_string(),
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

    let row: Option<(String, String, String, String)> = sqlx::query_as(
        "SELECT id, name, email, role FROM users WHERE email = ? AND password_hash = ?",
    )
    .bind(req.email.trim())
    .bind(&hash)
    .fetch_optional(&pool)
    .await?;

    match row {
        None => Err(AppError::Unauthorized),
        Some((id, name, email, role)) => {
            let token = create_session(&pool, &id).await?;
            Ok(Json(AuthResponse { id, name, email, role, token }))
        }
    }
}

/// GET /api/auth/me  —  validate the Bearer token; returns the user or 401
pub async fn me(
    headers: HeaderMap,
    State(pool): State<MySqlPool>,
) -> Result<Json<AuthResponse>, AppError> {
    let token = extract_bearer(&headers).ok_or(AppError::Unauthorized)?;

    let row: Option<(String, String, String, String)> = sqlx::query_as(
        "SELECT u.id, u.name, u.email, u.role
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.token = ? AND s.expires_at > NOW()",
    )
    .bind(&token)
    .fetch_optional(&pool)
    .await?;

    match row {
        None => Err(AppError::Unauthorized),
        Some((id, name, email, role)) => Ok(Json(AuthResponse { id, name, email, role, token })),
    }
}

/// DELETE /api/auth/logout  — revoke the current session
pub async fn logout(
    headers: HeaderMap,
    State(pool): State<MySqlPool>,
) -> Result<StatusCode, AppError> {
    if let Some(token) = extract_bearer(&headers) {
        sqlx::query("DELETE FROM sessions WHERE token = ?")
            .bind(&token)
            .execute(&pool)
            .await?;
    }
    Ok(StatusCode::NO_CONTENT)
}
