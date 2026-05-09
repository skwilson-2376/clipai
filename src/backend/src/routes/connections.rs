use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use sqlx::MySqlPool;

// GET /api/connections
pub async fn list(State(pool): State<MySqlPool>) -> Json<Vec<String>> {
    let rows = sqlx::query_scalar!(
        "SELECT platform FROM social_tokens ORDER BY connected_at DESC"
    )
    .fetch_all(&pool)
    .await
    .unwrap_or_default();

    Json(rows)
}

// DELETE /api/connections/:platform
pub async fn disconnect(
    Path(platform): Path<String>,
    State(pool): State<MySqlPool>,
) -> StatusCode {
    let result = sqlx::query!("DELETE FROM social_tokens WHERE platform = ?", platform)
        .execute(&pool)
        .await;

    match result {
        Ok(r) if r.rows_affected() > 0 => StatusCode::NO_CONTENT,
        Ok(_)  => StatusCode::NOT_FOUND,
        Err(e) => {
            tracing::error!("Failed to disconnect {}: {}", platform, e);
            StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}
