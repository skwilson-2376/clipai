use axum::{
    extract::{ConnectInfo, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::MySqlPool;
use std::net::SocketAddr;
use uuid::Uuid;

// ── Request ───────────────────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct SignupLogRequest {
    pub name:  String,
    pub email: String,
    pub plan:  Option<String>,
}

// ── Response ──────────────────────────────────────────────────────────────────

#[derive(Serialize)]
pub struct LogEntry {
    pub id:         String,
    pub event:      String,
    pub name:       String,
    pub email:      String,
    pub plan:       String,
    pub ip:         Option<String>,
    pub created_at: String,
}

// ── POST /api/logs  (called from sign-up form) ────────────────────────────────

pub async fn create(
    State(pool):   State<MySqlPool>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(body):    Json<SignupLogRequest>,
) -> Result<StatusCode, StatusCode> {
    let id    = Uuid::new_v4().to_string();
    let plan  = body.plan.as_deref().unwrap_or("free").to_string();
    let ip    = addr.ip().to_string();

    sqlx::query!(
        "INSERT INTO user_logs (id, event, name, email, plan, ip) VALUES (?, 'signup_free', ?, ?, ?, ?)",
        id, body.name, body.email, plan, ip,
    )
    .execute(&pool)
    .await
    .map_err(|e| { tracing::error!("Failed to write signup log: {e}"); StatusCode::INTERNAL_SERVER_ERROR })?;

    tracing::info!("New free signup: {} <{}>", body.name, body.email);
    Ok(StatusCode::CREATED)
}

// ── GET /api/logs  (admin — view all sign-ups) ────────────────────────────────

pub async fn list(State(pool): State<MySqlPool>) -> Result<Json<Vec<LogEntry>>, StatusCode> {
    let rows = sqlx::query!(
        "SELECT id, event, name, email, plan, ip,
                DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at
         FROM user_logs
         ORDER BY created_at DESC
         LIMIT 500"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| { tracing::error!("Failed to fetch logs: {e}"); StatusCode::INTERNAL_SERVER_ERROR })?;

    let entries = rows
        .into_iter()
        .map(|r| LogEntry {
            id:         r.id,
            event:      r.event,
            name:       r.name,
            email:      r.email,
            plan:       r.plan,
            ip:         r.ip,
            created_at: r.created_at.unwrap_or_default(),
        })
        .collect();

    Ok(Json(entries))
}
