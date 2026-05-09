use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Database error")]
    Db(#[from] sqlx::Error),

    #[error("Not found")]
    NotFound,

    #[error("Bad request: {0}")]
    BadRequest(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, msg) = match &self {
            AppError::Db(e) => {
                tracing::error!("db error: {e}");
                (StatusCode::INTERNAL_SERVER_ERROR, "internal database error".to_string())
            }
            AppError::NotFound       => (StatusCode::NOT_FOUND, self.to_string()),
            AppError::BadRequest(m)  => (StatusCode::BAD_REQUEST, m.clone()),
        };
        (status, Json(json!({ "error": msg }))).into_response()
    }
}
