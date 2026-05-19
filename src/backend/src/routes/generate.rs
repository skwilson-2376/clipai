use axum::{extract::State, Json};
use rand::Rng;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::MySqlPool;
use std::time::Duration;
use uuid::Uuid;

use crate::{error::AppError, models::Generation, AppState};

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
    pub camera_motion: Option<String>,
    pub source_photo_url: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct GenerateResponse {
    pub id: String,
}

// ── Handlers ─────────────────────────────────────────────────────────────────

/// POST /api/generate
pub async fn create(
    State(state): State<AppState>,
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
    .execute(&state.pool)
    .await?;

    let pool = state.pool.clone();
    let http = state.http_client.clone();
    let id2 = id.clone();

    tokio::spawn(async move {
        let api_token = std::env::var("REPLICATE_API_TOKEN").unwrap_or_default();
        if api_token.is_empty() || api_token == "your_replicate_api_token" {
            tracing::info!("No Replicate token — running simulation for {}", id2);
            simulate_generation(pool, id2).await;
        } else {
            run_replicate_generation(http, pool, id2, req, api_token).await;
        }
    });

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

// ── Replicate API integration ─────────────────────────────────────────────────

#[derive(Deserialize)]
struct ReplicatePrediction {
    id: String,
    status: String,
    output: Option<Value>,
    error: Option<Value>,
}

async fn run_replicate_generation(
    client: Client,
    pool: MySqlPool,
    id: String,
    req: GenerateRequest,
    api_token: String,
) {
    set_progress(&pool, &id, "processing", 5, None).await;

    let (owner, model, input) = build_replicate_input(&req);
    tracing::info!("Starting Replicate prediction — model={}/{} gen={}", owner, model, id);

    let pred_id = match create_prediction(&client, &api_token, owner, model, input).await {
        Ok(pid) => pid,
        Err(e) => {
            tracing::error!("Replicate create failed for {}: {}", id, e);
            set_progress(&pool, &id, "failed", 0, None).await;
            return;
        }
    };

    tracing::info!("Replicate prediction {} created for gen {}", pred_id, id);
    set_progress(&pool, &id, "processing", 20, None).await;

    let output_url = match poll_prediction(&client, &api_token, &pred_id, &pool, &id).await {
        Ok(url) => url,
        Err(e) => {
            tracing::error!("Replicate poll failed for gen {}: {}", id, e);
            set_progress(&pool, &id, "failed", 0, None).await;
            return;
        }
    };

    tracing::info!("Replicate succeeded for gen {} — downloading from {}", id, output_url);
    set_progress(&pool, &id, "processing", 88, None).await;

    let videos_dir = std::env::var("VIDEOS_DIR").unwrap_or_else(|_| "./videos".to_string());
    let video_api_path = match download_video(&client, &output_url, &id, &videos_dir).await {
        Ok(path) => path,
        Err(e) => {
            tracing::error!("Video download failed for gen {}: {}", id, e);
            set_progress(&pool, &id, "failed", 0, None).await;
            return;
        }
    };

    set_progress(&pool, &id, "done", 100, Some(&video_api_path)).await;
    tracing::info!("Gen {} done — {}", id, video_api_path);
}

fn build_replicate_input(req: &GenerateRequest) -> (&'static str, &'static str, Value) {
    if let Some(photo_url) = &req.source_photo_url {
        // Image-to-video: Stable Video Diffusion
        let motion_bucket = ((req.motion_intensity as f64 / 100.0) * 254.0) as u64 + 1;
        (
            "stability-ai",
            "stable-video-diffusion",
            serde_json::json!({
                "image":             photo_url,
                "video_length":      "25_frames_with_svd_xt",
                "motion_bucket_id":  motion_bucket.min(255),
                "fps_id":            8,
                "cond_aug":          0.02,
            }),
        )
    } else {
        // Text-to-video: MiniMax Video-01
        let enhanced = enhance_prompt(
            &req.prompt,
            &req.style,
            req.camera_motion.as_deref(),
            req.motion_intensity,
        );
        (
            "minimax",
            "video-01",
            serde_json::json!({
                "prompt":           enhanced,
                "prompt_optimizer": true,
            }),
        )
    }
}

fn enhance_prompt(prompt: &str, style: &str, camera_motion: Option<&str>, motion_intensity: i32) -> String {
    let style_tag = match style {
        "parallax-3d"   => "cinematic parallax 3D depth animation",
        "smooth-cinema" => "smooth cinematic motion, fluid professional filmmaking",
        "clay-motion"   => "claymation stop-motion animation style",
        "cel-animation" => "2D hand-drawn cel animation, traditional anime style",
        "ken-burns"     => "documentary Ken Burns slow zoom and pan",
        "watercolor"    => "watercolor painting animation, painterly artistic style",
        _               => "cinematic short film animation",
    };
    let cam_tag = match camera_motion {
        Some("parallax")  => ", parallax camera movement",
        Some("orbit")     => ", orbiting camera",
        Some("zoom-in")   => ", slow cinematic zoom in",
        Some("pan-left")  => ", camera panning left",
        Some("pan-right") => ", camera panning right",
        Some("dolly-out") => ", camera dolly out",
        _                 => "",
    };
    let motion_tag = if motion_intensity > 70 {
        ", high motion energy and dynamic movement"
    } else if motion_intensity < 30 {
        ", subtle calm minimal motion"
    } else {
        ""
    };
    format!("{} — {}{}{}", prompt, style_tag, cam_tag, motion_tag)
}

async fn create_prediction(
    client: &Client,
    api_token: &str,
    owner: &str,
    model: &str,
    input: Value,
) -> anyhow::Result<String> {
    let url = format!("https://api.replicate.com/v1/models/{}/{}/predictions", owner, model);

    let resp = client
        .post(&url)
        .header("Authorization", format!("Token {}", api_token))
        .json(&serde_json::json!({ "input": input }))
        .send()
        .await?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        return Err(anyhow::anyhow!("Replicate {} {}: {}", owner, status, body));
    }

    let pred: ReplicatePrediction = resp.json().await?;
    Ok(pred.id)
}

async fn poll_prediction(
    client: &Client,
    api_token: &str,
    prediction_id: &str,
    pool: &MySqlPool,
    gen_id: &str,
) -> anyhow::Result<String> {
    let url = format!("https://api.replicate.com/v1/predictions/{}", prediction_id);
    let mut reported_progress: i32 = 25;

    for attempt in 0..90 {
        // Back off: first 20 polls every 3s, then every 5s
        let delay = if attempt < 20 { 3 } else { 5 };
        tokio::time::sleep(Duration::from_secs(delay)).await;

        let resp = client
            .get(&url)
            .header("Authorization", format!("Token {}", api_token))
            .send()
            .await?;

        let pred: ReplicatePrediction = resp.json().await?;

        match pred.status.as_str() {
            "succeeded" => {
                return extract_output_url(pred.output);
            }
            "failed" | "canceled" => {
                return Err(anyhow::anyhow!(
                    "Prediction {} {}: {:?}",
                    prediction_id,
                    pred.status,
                    pred.error
                ));
            }
            _ => {
                // Advance progress slowly between 25 and 85
                reported_progress = (reported_progress + 3).min(85);
                set_progress(pool, gen_id, "processing", reported_progress, None).await;
            }
        }
    }

    Err(anyhow::anyhow!("Prediction {} timed out", prediction_id))
}

fn extract_output_url(output: Option<Value>) -> anyhow::Result<String> {
    match output {
        Some(Value::String(s)) if !s.is_empty() => Ok(s),
        Some(Value::Array(arr)) => arr
            .into_iter()
            .find_map(|v| v.as_str().filter(|s| !s.is_empty()).map(String::from))
            .ok_or_else(|| anyhow::anyhow!("empty output array from Replicate")),
        other => Err(anyhow::anyhow!("unexpected Replicate output: {:?}", other)),
    }
}

async fn download_video(
    client: &Client,
    url: &str,
    gen_id: &str,
    videos_dir: &str,
) -> anyhow::Result<String> {
    tokio::fs::create_dir_all(videos_dir).await?;

    let filename = format!("{}.mp4", gen_id);
    let path = std::path::Path::new(videos_dir).join(&filename);

    let bytes = client.get(url).send().await?.bytes().await?;
    tokio::fs::write(&path, &bytes).await?;

    tracing::info!("Saved {} bytes to {:?}", bytes.len(), path);
    Ok(format!("/api/videos/{}", filename))
}

// ── Progress helper ───────────────────────────────────────────────────────────

async fn set_progress(pool: &MySqlPool, id: &str, status: &str, progress: i32, video_url: Option<&str>) {
    let result = if let Some(url) = video_url {
        sqlx::query(
            "UPDATE generations SET status = ?, progress = ?, video_url = ? WHERE id = ?",
        )
        .bind(status)
        .bind(progress)
        .bind(url)
        .bind(id)
        .execute(pool)
        .await
    } else {
        sqlx::query("UPDATE generations SET status = ?, progress = ? WHERE id = ?")
            .bind(status)
            .bind(progress)
            .bind(id)
            .execute(pool)
            .await
    };
    if let Err(e) = result {
        tracing::warn!("set_progress DB error for {}: {}", id, e);
    }
}

// ── Simulation fallback (used when REPLICATE_API_TOKEN is not set) ─────────────

async fn simulate_generation(pool: MySqlPool, id: String) {
    use tokio::time::sleep;

    let _ = sqlx::query(
        "UPDATE generations SET status = 'processing', progress = 5 WHERE id = ?",
    )
    .bind(&id)
    .execute(&pool)
    .await;

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
