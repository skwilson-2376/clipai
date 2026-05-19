use axum::{
    extract::FromRef,
    routing::{delete, get, post},
    Json, Router,
};
use serde_json::json;
use sqlx::mysql::MySqlPoolOptions;
use std::{collections::HashMap, net::SocketAddr, sync::Arc};
use tokio::sync::Mutex;
use tower_http::{
    compression::CompressionLayer,
    cors::CorsLayer,
    services::ServeDir,
    trace::TraceLayer,
};

mod error;
mod models;
mod routes;

// ── Shared state ──────────────────────────────────────────────────────────────

#[derive(Clone)]
pub struct OAuthEntry {
    pub platform: String,
    pub verifier: Option<String>,
}

#[derive(Clone)]
pub struct AppState {
    pub pool:         sqlx::MySqlPool,
    pub oauth_states: Arc<Mutex<HashMap<String, OAuthEntry>>>,
    pub http_client:  reqwest::Client,
}

impl FromRef<AppState> for sqlx::MySqlPool {
    fn from_ref(state: &AppState) -> Self {
        state.pool.clone()
    }
}

// ── Main ──────────────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "clipai_backend=info,tower_http=info".into()),
        )
        .init();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let videos_dir   = std::env::var("VIDEOS_DIR").unwrap_or_else(|_| "./videos".to_string());

    // Create videos directory if it doesn't exist
    tokio::fs::create_dir_all(&videos_dir).await?;
    tracing::info!("Videos directory: {}", videos_dir);

    tracing::info!("Connecting to database…");
    let pool = MySqlPoolOptions::new()
        .max_connections(20)
        .min_connections(2)
        .acquire_timeout(std::time::Duration::from_secs(10))
        .connect(&database_url)
        .await?;

    tracing::info!("Running migrations…");
    sqlx::migrate!("./migrations").run(&pool).await?;
    tracing::info!("Migrations complete.");

    let http_client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()?;

    let state = AppState {
        pool,
        oauth_states: Arc::new(Mutex::new(HashMap::new())),
        http_client,
    };

    let cors = CorsLayer::permissive();

    let app = Router::new()
        // Health
        .route("/health", get(health))
        // Video generation
        .route("/api/generate",       post(routes::generate::create))
        .route("/api/generations",    get(routes::generate::list))
        // SSE status
        .route("/api/status/:id",     get(routes::status::stream))
        // Characters
        .route("/api/characters",     get(routes::characters::list).post(routes::characters::create))
        .route("/api/characters/:id", delete(routes::characters::delete))
        // Social connections
        .route("/api/connections",            get(routes::connections::list))
        .route("/api/connections/:platform",  delete(routes::connections::disconnect))
        // OAuth flows
        .route("/api/oauth/:platform/start",    get(routes::oauth::start))
        .route("/api/oauth/:platform/callback", get(routes::oauth::callback))
        // Auth
        .route("/api/auth/register", post(routes::auth::register))
        .route("/api/auth/login",    post(routes::auth::login))
        .route("/api/auth/me",       get(routes::auth::me))
        .route("/api/auth/logout",   delete(routes::auth::logout))
        // Sign-up logs
        .route("/api/logs", post(routes::logs::create).get(routes::logs::list))
        .with_state(state)
        // Serve generated video files at /api/videos/<filename>
        .nest_service("/api/videos", ServeDir::new(&videos_dir))
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
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;

    Ok(())
}

async fn health() -> Json<serde_json::Value> {
    Json(json!({ "status": "ok", "service": "clipai-backend" }))
}
