use axum::{
    routing::{delete, get, post},
    Json, Router,
};
use serde_json::json;
use sqlx::mysql::MySqlPoolOptions;
use std::net::SocketAddr;
use tower_http::{compression::CompressionLayer, cors::CorsLayer, trace::TraceLayer};

mod error;
mod models;
mod routes;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load .env file (ignored if missing in production)
    dotenvy::dotenv().ok();

    // Structured logging
    tracing_subscriber::fmt()
        .with_env_filter(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "clipai_backend=info,tower_http=info".into()),
        )
        .init();

    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL env var must be set");

    tracing::info!("Connecting to database…");

    let pool = MySqlPoolOptions::new()
        .max_connections(20)
        .min_connections(2)
        .acquire_timeout(std::time::Duration::from_secs(10))
        .connect(&database_url)
        .await?;

    // Run migrations automatically on startup
    tracing::info!("Running migrations…");
    sqlx::migrate!("./migrations").run(&pool).await?;
    tracing::info!("Migrations complete.");

    // CORS — allow the Vite dev server and any production origin
    let cors = CorsLayer::permissive();

    let app = Router::new()
        // Health
        .route("/health", get(health))
        // Generations
        .route("/api/generate",       post(routes::generate::create))
        .route("/api/generations",    get(routes::generate::list))
        // SSE status stream
        .route("/api/status/:id",     get(routes::status::stream))
        // Characters
        .route("/api/characters",     get(routes::characters::list).post(routes::characters::create))
        .route("/api/characters/:id", delete(routes::characters::delete))
        .with_state(pool)
        .layer(cors)
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http());

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("ClipAI backend listening on http://{addr}");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn health() -> Json<serde_json::Value> {
    Json(json!({ "status": "ok", "service": "clipai-backend" }))
}
